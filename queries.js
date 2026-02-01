import { HttpError } from 'wasp/server';

export const getUser = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
    include: {
      branch: true
    }
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return user;
};

export const getInventory = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const whereClause = context.user.branchId 
    ? { branchId: context.user.branchId }
    : {};

  const inventory = await context.entities.Inventory.findMany({
    where: whereClause,
    include: {
      product: true,
      branch: true
    },
    orderBy: {
      lastUpdated: 'desc'
    }
  });

  return inventory;
};

export const getProducts = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const products = await context.entities.Product.findMany({
    include: {
      inventory: {
        include: {
          branch: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return products;
};

export const getProduct = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const { id, barcode, sku } = args;

  let whereClause = {};
  if (id) {
    whereClause = { id: parseInt(id) };
  } else if (barcode) {
    whereClause = { barcode };
  } else if (sku) {
    whereClause = { sku };
  } else {
    throw new HttpError(400, 'Must provide id, barcode, or sku');
  }

  const product = await context.entities.Product.findUnique({
    where: whereClause,
    include: {
      inventory: {
        include: {
          branch: true
        }
      }
    }
  });

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  return product;
};

export const getSales = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const { startDate, endDate, branchId } = args || {};

  let whereClause = {};
  
  if (context.user.branchId && !branchId) {
    whereClause.branchId = context.user.branchId;
  } else if (branchId) {
    whereClause.branchId = branchId;
  }

  if (startDate || endDate) {
    whereClause.saleDate = {};
    if (startDate) {
      whereClause.saleDate.gte = new Date(startDate);
    }
    if (endDate) {
      whereClause.saleDate.lte = new Date(endDate);
    }
  }

  const sales = await context.entities.Sale.findMany({
    where: whereClause,
    include: {
      user: true,
      branch: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      saleDate: 'desc'
    }
  });

  return sales;
};

export const getSalesReport = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const { startDate, endDate } = args || {};

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const whereClause = {
    saleDate: {
      gte: startDate ? new Date(startDate) : sevenDaysAgo,
      lte: endDate ? new Date(endDate) : today
    }
  };

  if (context.user.branchId) {
    whereClause.branchId = context.user.branchId;
  }

  const sales = await context.entities.Sale.findMany({
    where: whereClause,
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalSalesCount = sales.length;

  const productBreakdown = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productBreakdown[item.productId]) {
        productBreakdown[item.productId] = {
          id: item.product.id,
          name: item.product.name,
          category: item.product.category,
          quantitySold: 0,
          revenue: 0
        };
      }
      productBreakdown[item.productId].quantitySold += item.quantity;
      productBreakdown[item.productId].revenue += item.price;
    });
  });

  return {
    totalSalesAmount,
    totalSalesCount,
    productBreakdown: Object.values(productBreakdown),
    dateRange: {
      startDate: whereClause.saleDate.gte,
      endDate: whereClause.saleDate.lte
    }
  };
};

export const getAlerts = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const { isRead } = args || {};

  let whereClause = {};
  if (typeof isRead === 'boolean') {
    whereClause.isRead = isRead;
  }

  const alerts = await context.entities.Alert.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  });

  return alerts;
};
