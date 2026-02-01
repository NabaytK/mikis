# BeshGebeya Tracker

A comprehensive inventory management system for fresh markets (Besh Gebeya) in Ethiopia. This application helps track products, manage inventory across multiple branches, record sales, and generate alerts for low stock and expiring items.

## Features

### 🏪 Product Management
- Add and manage products with detailed information
- Track SKU, barcode, category, brand, and pricing
- View profit margins and stock levels
- Search and filter products by category

### 📦 Inventory Management
- Real-time inventory tracking across branches
- Batch number and expiry date tracking
- Automatic status updates (Available, Low Stock, Expired, Discontinued)
- Set minimum stock thresholds
- FIFO (First In, First Out) inventory depletion

### 💰 Sales Tracking
- Quick sale recording with multiple items
- Support for multiple payment types (Cash, Card, Mobile)
- Automatic inventory deduction
- Sales history with detailed item breakdowns
- Real-time sales reports and analytics

### 🔔 Smart Alerts
- Low stock alerts when inventory falls below threshold
- Near-expiry warnings (7 days before expiration)
- Expired product notifications
- Automatic alert generation

### 📊 Dashboard & Reporting
- Sales metrics and analytics
- Top-selling products breakdown
- Date range filtering for reports
- Revenue tracking by product category

### 🏢 Multi-Branch Support
- Branch-specific inventory management
- User assignment to branches
- Branch-wise sales tracking

## Tech Stack

- **Framework**: [Wasp](https://wasp-lang.dev/) - Full-stack framework
- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Prisma ORM
- **Database**: SQLite (easily switchable to PostgreSQL)
- **Authentication**: Built-in Wasp authentication with username/password

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Wasp CLI

## Installation

### 1. Install Wasp

```bash
curl -sSL https://get.wasp-lang.dev/installer.sh | sh
```

Or on Windows:
```powershell
iwr https://get.wasp-lang.dev/installer.ps1 -useb | iex
```

### 2. Clone/Download the Project

```bash
cd BeshGebeyaTracker
```

### 3. Install Dependencies

The dependencies will be automatically installed when you run Wasp.

### 4. Database Setup

The SQLite database will be automatically created when you start the app. For the first time, you'll need to create the database schema:

```bash
wasp db migrate-dev
```

### 5. Seed Initial Data (Optional)

You can manually add a branch through the database or modify the code to add seed data. To add a branch manually:

```bash
wasp db studio
```

This opens Prisma Studio where you can add a Branch record with:
- name: "Main Branch"
- location: "Addis Ababa"
- phone: "+251911234567"

## Running the Application

### Development Mode

```bash
wasp start
```

This will start both the backend server and frontend development server:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Production Build

```bash
wasp build
```

Then deploy the `.wasp/build` directory to your hosting platform.

## Usage Guide

### First Time Setup

1. **Sign Up**: Create an account at http://localhost:3000/signup
2. **Create Products**: Navigate to Products page and add your inventory items
3. **Update Inventory**: Go to Inventory page and add stock quantities
4. **Record Sales**: Use the Sales page to record transactions
5. **Monitor Dashboard**: Check Dashboard for sales metrics and alerts

### Adding Products

1. Click "+ Add Product" on Products page
2. Fill in required fields:
   - Product Name
   - SKU (Stock Keeping Unit)
   - Category (e.g., Vegetables, Fruits, Grains)
   - Cost Price (what you pay)
   - Unit Price (what you sell for)
3. Optional fields: Barcode, Brand, Supplier, Description
4. Click "Create Product"

### Managing Inventory

1. Click "+ Add/Update Stock" on Inventory page
2. Select the product
3. Enter quantity on hand
4. Set minimum threshold (for low stock alerts)
5. Add expiry date (if applicable)
6. Add batch number (optional)
7. Click "Update Inventory"

### Recording Sales

1. Click "+ New Sale" on Sales page
2. Select products and quantities
3. Add multiple items if needed
4. Choose payment type (Cash/Card/Mobile)
5. Review total amount
6. Click "Complete Sale"

The system will:
- Automatically deduct from inventory using FIFO
- Create sale record with all items
- Update dashboard metrics
- Generate alerts if stock becomes low

### Generating Alerts

Click "Generate Alerts" on the Dashboard to:
- Check all inventory for low stock
- Identify near-expiry items (within 7 days)
- Mark expired items
- Create alert notifications

## Database Schema

### Main Entities

- **User**: System users with branch assignments
- **Branch**: Different store locations
- **Product**: Items for sale
- **Inventory**: Stock levels by product and branch
- **Sale**: Transaction records
- **SaleItem**: Individual items in each sale
- **Alert**: System notifications

### Key Relationships

- Users belong to Branches
- Inventory tracks Products at specific Branches
- Sales are made by Users at Branches
- SaleItems link Sales to Products

## Configuration

### Changing Database

To use PostgreSQL instead of SQLite, update `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then set the DATABASE_URL environment variable.

### Environment Variables

Create a `.env.server` file in the project root:

```env
DATABASE_URL="file:./dev.db"
```

## Troubleshooting

### Database Issues

If you encounter database errors:

```bash
wasp clean
wasp db migrate-dev
```

### Port Already in Use

Change the ports in `wasp` settings or kill the process using the port:

```bash
# Find process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installing

```bash
wasp clean
rm -rf node_modules
wasp start
```

## Features Roadmap

- [ ] Export sales reports to Excel/PDF
- [ ] Multi-currency support
- [ ] Barcode scanner integration
- [ ] Receipt printing
- [ ] Customer management
- [ ] Supplier management
- [ ] Purchase order tracking
- [ ] Advanced analytics and charts
- [ ] Mobile app version
- [ ] SMS/Email alert notifications

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

## Acknowledgments

Built with Wasp - The fastest way to develop full-stack web apps with React & Node.js.

---

**BeshGebeya Tracker** - Simplifying fresh market inventory management in Ethiopia 🇪🇹
