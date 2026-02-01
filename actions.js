import { HttpError } from 'wasp/server';

export const createProduct = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const {
    name,
    description,
    barcode,
    sku,
    category,
    brand,
    unitPrice,
    costPrice,
    supplier
  } = args;

  // Validate required fields
  if (!name || !sku || !category || unitPrice === undefined || costPrice === undefined) {
    throw new HttpError(400, 'Missing required fields');
  }

  try {
    const product = await context.entities.Product.create({
      data: {
        name,
        description: description || '',
        barcode: barcode || null,
        sku,
        category,
        brand: brand || '',
        unitPrice: parseFloat(unitPrice),
        costPrice: parseFloat(costPrice),
        supplier: supplier || ''
      }
    });

    return product;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new HttpError(400, 'Product with this SKU or barcode already exists');
    }
    throw error;
  }
};

export const updateInventory = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const {
    productId,
    branchId,
    quantityOnHand,
    thresholdMin,
    expiryDate,
    batchNumber,
    status
  } = args;

  if (!productId || !branchId) {
    throw new HttpError(400, 'Product ID and Branch ID are required');
  }

  const userBranchId = context.user.branchId || branchId;

  // Check if inventory record exists
  const existingInventory = await context.entities.Inventory.findFirst({
    where: {
      productId: parseInt(productId),
      branchId: parseInt(userBranchId),
      batchNumber: batchNumber || null
    }
  });

  let inventory;
  if (existingInventory) {
    inventory = await context.entities.Inventory.update({
      where: { id: existingInventory.id },
      data: {
        quantityOnHand: quantityOnHand !== undefined ? parseInt(quantityOnHand) : existingInventory.quantityOnHand,
        thresholdMin: thresholdMin !== undefined ? parseInt(thresholdMin) : existingInventory.thresholdMin,
        expiryDate: expiryDate ? new Date(expiryDate) : existingInventory.expiryDate,
        status: status || existingInventory.status
      },
      include: {
        product: true,
        branch: true
      }
    });
  } else {
    inventory = await context.entities.Inventory.create({
      data: {
        productId: parseInt(productId),
        branchId: parseInt(userBranchId),
        quantityOnHand: parseInt(quantityOnHand || 0),
        thresholdMin: parseInt(thresholdMin || 10),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        batchNumber: batchNumber || null,
        status: status || 'AVAILABLE'
      },
      include: {
        product: true,
        branch: true
      }
    });
  }

  return inventory;
};

export const createSale = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const { items, paymentType } = args;

  if (!items || items.length === 0) {
    throw new HttpError(400, 'Sale must have at least one item');
  }

  if (!paymentType) {
    throw new HttpError(400, 'Payment type is required');
  }

  if (!context.user.branchId) {
    throw new HttpError(400, 'User must be assigned to a branch');
  }

  try {
    // Use a transaction to ensure data consistency
    const result = await context.entities.$transaction(async (prisma) => {
      let totalAmount = 0;
      const saleItemsData = [];

      // Process each item
      for (const item of items) {
        const { productId, quantity } = item;

        if (!productId || !quantity || quantity <= 0) {
          throw new HttpError(400, 'Invalid item data');
        }

        // Get product
        const product = await prisma.product.findUnique({
          where: { id: parseInt(productId) }
        });

        if (!product) {
          throw new HttpError(404, `Product ${productId} not found`);
        }

        // Get available inventory for this product at user's branch
        const inventoryItems = await prisma.inventory.findMany({
          where: {
            productId: parseInt(productId),
            branchId: context.user.branchId,
            status: 'AVAILABLE',
            quantityOnHand: { gt: 0 }
          },
          orderBy: [
            { expiryDate: 'asc' },
            { createdAt: 'asc' }
          ]
        });

        // Calculate total available quantity
        const totalAvailable = inventoryItems.reduce((sum, inv) => sum + inv.quantityOnHand, 0);

        if (totalAvailable < quantity) {
          throw new HttpError(400, `Insufficient stock for ${product.name}. Available: ${totalAvailable}, Requested: ${quantity}`);
        }

        // Deduct from inventory using FIFO
        let remainingQuantity = quantity;
        for (const inventoryItem of inventoryItems) {
          if (remainingQuantity <= 0) break;

          const deductQty = Math.min(inventoryItem.quantityOnHand, remainingQuantity);
          
          await prisma.inventory.update({
            where: { id: inventoryItem.id },
            data: {
              quantityOnHand: inventoryItem.quantityOnHand - deductQty,
              status: inventoryItem.quantityOnHand - deductQty <= 0 ? 'DISCONTINUED' : inventoryItem.status
            }
          });

          remainingQuantity -= deductQty;
        }

        const itemTotal = product.unitPrice * quantity;
        totalAmount += itemTotal;

        saleItemsData.push({
          productId: parseInt(productId),
          quantity: parseInt(quantity),
          price: itemTotal
        });
      }

      // Create the sale
      const sale = await prisma.sale.create({
        data: {
          userId: context.user.id,
          branchId: context.user.branchId,
          totalAmount,
          paymentType,
          items: {
            create: saleItemsData
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: true,
          branch: true
        }
      });

      return sale;
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Sale creation error:', error);
    throw new HttpError(500, 'Failed to create sale: ' + error.message);
  }
};

export const generateLowStockAlerts = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const whereClause = context.user.branchId 
    ? { branchId: context.user.branchId }
    : {};

  const inventoryItems = await context.entities.Inventory.findMany({
    where: whereClause,
    include: {
      product: true,
      branch: true
    }
  });

  const alerts = [];

  for (const item of inventoryItems) {
    // Low stock alert
    if (item.quantityOnHand <= item.thresholdMin && item.status === 'AVAILABLE') {
      const existingAlert = await context.entities.Alert.findFirst({
        where: {
          type: 'LOW_STOCK',
          productId: item.productId,
          branchId: item.branchId,
          isRead: false,
          createdAt: {
            gte: new Date(today.setHours(0, 0, 0, 0))
          }
        }
      });

      if (!existingAlert) {
        const alert = await context.entities.Alert.create({
          data: {
            type: 'LOW_STOCK',
            message: `Low stock alert: ${item.product.name} at ${item.branch.name}. Only ${item.quantityOnHand} units remaining (threshold: ${item.thresholdMin})`,
            productId: item.productId,
            branchId: item.branchId,
            isRead: false
          }
        });
        alerts.push(alert);
      }
    }

    // Near expiry alert
    if (item.expiryDate && item.expiryDate <= sevenDaysFromNow && item.expiryDate > today) {
      const existingAlert = await context.entities.Alert.findFirst({
        where: {
          type: 'NEAR_EXPIRY',
          productId: item.productId,
          branchId: item.branchId,
          isRead: false,
          createdAt: {
            gte: new Date(today.setHours(0, 0, 0, 0))
          }
        }
      });

      if (!existingAlert) {
        const daysUntilExpiry = Math.ceil((item.expiryDate - today) / (1000 * 60 * 60 * 24));
        const alert = await context.entities.Alert.create({
          data: {
            type: 'NEAR_EXPIRY',
            message: `Expiry warning: ${item.product.name} at ${item.branch.name} expires in ${daysUntilExpiry} day(s)`,
            productId: item.productId,
            branchId: item.branchId,
            isRead: false
          }
        });
        alerts.push(alert);
      }
    }

    // Expired alert
    if (item.expiryDate && item.expiryDate <= today && item.status !== 'EXPIRED') {
      await context.entities.Inventory.update({
        where: { id: item.id },
        data: { status: 'EXPIRED' }
      });

      const existingAlert = await context.entities.Alert.findFirst({
        where: {
          type: 'EXPIRED',
          productId: item.productId,
          branchId: item.branchId,
          isRead: false
        }
      });

      if (!existingAlert) {
        const alert = await context.entities.Alert.create({
          data: {
            type: 'EXPIRED',
            message: `Expired product: ${item.product.name} at ${item.branch.name}`,
            productId: item.productId,
            branchId: item.branchId,
            isRead: false
          }
        });
        alerts.push(alert);
      }
    }
  }

  return alerts;
};

export const markAlertAsRead = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const { alertId } = args;

  if (!alertId) {
    throw new HttpError(400, 'Alert ID is required');
  }

  const alert = await context.entities.Alert.update({
    where: { id: parseInt(alertId) },
    data: { isRead: true }
  });

  return alert;
};
