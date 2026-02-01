# Quick Start Guide - BeshGebeya Tracker

## Get Started in 5 Minutes

### Step 1: Install Wasp (One-time setup)

**Mac/Linux:**
```bash
curl -sSL https://get.wasp-lang.dev/installer.sh | sh
```

**Windows:**
```powershell
iwr https://get.wasp-lang.dev/installer.ps1 -useb | iex
```

### Step 2: Initialize Database

```bash
cd BeshGebeyaTracker
wasp db migrate-dev
```

When prompted for a migration name, type: `initial`

### Step 3: Seed Initial Data

Run this command to open the database studio:
```bash
wasp db studio
```

Add a Branch:
1. Click on "Branch" in the left sidebar
2. Click "Add record"
3. Fill in:
   - name: "Main Branch"
   - location: "Addis Ababa, Ethiopia"
   - phone: "+251911234567"
4. Click "Save 1 change"

### Step 4: Start the Application

```bash
wasp start
```

Wait for both servers to start:
- ✅ Frontend running on http://localhost:3000
- ✅ Backend running on http://localhost:3001

### Step 5: Create Your Account

1. Open http://localhost:3000 in your browser
2. Click "Sign up"
3. Create your account with:
   - Username
   - Email
   - Password (minimum 8 characters)

### Step 6: Add Your First Product

1. Navigate to "Products" page
2. Click "+ Add Product"
3. Fill in the form:
   ```
   Product Name: Tomatoes
   SKU: TOM-001
   Category: Vegetables
   Cost Price: 50
   Unit Price: 75
   ```
4. Click "Create Product"

### Step 7: Add Inventory

1. Navigate to "Inventory" page
2. Click "+ Add/Update Stock"
3. Fill in:
   ```
   Product: Tomatoes
   Quantity: 100
   Minimum Threshold: 20
   Expiry Date: [7 days from now]
   Status: Available
   ```
4. Click "Update Inventory"

### Step 8: Record Your First Sale

1. Navigate to "Sales" page
2. Click "+ New Sale"
3. Select product and quantity:
   ```
   Product: Tomatoes - 75 ETB
   Quantity: 5
   Payment Type: Cash
   ```
4. Click "Complete Sale"

### Step 9: Check Dashboard

1. Navigate to "Dashboard"
2. Click "Generate Alerts" to see inventory alerts
3. View sales metrics and top-selling products

## Common Commands

### Database Management
```bash
# View/edit database
wasp db studio

# Reset database
wasp clean
wasp db migrate-dev

# Create new migration
wasp db migrate-dev
```

### Development
```bash
# Start development servers
wasp start

# Clean build artifacts
wasp clean

# Build for production
wasp build
```

## Default Credentials (For Testing)

After signup, you can create test data:

**Sample Products:**
- Tomatoes (SKU: TOM-001)
- Onions (SKU: ONI-001)
- Potatoes (SKU: POT-001)
- Rice (SKU: RIC-001)
- Teff (SKU: TEF-001)

## Need Help?

- Check the main README.md for detailed documentation
- Visit https://wasp-lang.dev/docs for Wasp documentation
- Open an issue if you encounter problems

## Next Steps

- Explore all features in the navigation menu
- Set up alerts for low stock items
- Generate sales reports
- Add more products and inventory

Happy tracking! 🚀
