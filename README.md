# Splitwise Clone - Mobile App

A React-based Splitwise clone with mobile-first design for expense tracking and splitting among groups.

## Features

✅ **User Management** - Add and manage users
✅ **Group Creation** - Create groups with selected users  
✅ **Expense Tracking** - Add expenses with detailed sharing options
✅ **Balance Calculation** - Automatic balance calculations showing who owes what
✅ **Transaction History** - Date-wise expense organization
✅ **Individual Spending Analysis** - Detailed breakdown of spending per person
✅ **Mobile-First Design** - Optimized for mobile devices
✅ **Local Storage** - Data persistence using localStorage

## Project Structure

```
src/
├── App.js                    # Main application component
├── index.css                 # Tailwind CSS imports and custom styles
├── components/
│   ├── Sidebar.js           # Navigation sidebar
│   ├── UsersView.js         # User management interface
│   ├── GroupsView.js        # Group management interface
│   └── GroupDetailView.js   # Individual group details and expense management
└── utils/
    └── storage.js           # localStorage utility functions
```

## Setup Instructions

### 1. Create React App

```bash
npx create-react-app splitwise-clone
cd splitwise-clone
```

### 2. Install Dependencies

```bash
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
```

### 3. Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

### 4. Copy Files

- Replace `src/App.js` with the App component code
- Replace `src/index.css` with the CSS file content
- Create `src/components/` folder and add all component files
- Create `src/utils/` folder and add `storage.js`
- Replace `tailwind.config.js` with the provided config

### 5. Update package.json

Replace your `package.json` dependencies section with the provided one.

### 6. Start Development Server

```bash
npm start
```

## Usage

### Adding Users

1. Click the Users icon in the sidebar
2. Click the + button to add a new user
3. Enter name (required) and email (optional)

### Creating Groups

1. Click the Groups icon in the sidebar
2. Click the + button to create a new group
3. Enter group name and select members
4. At least one member is required

### Adding Expenses

1. Click on a group to enter group details
2. Click the + button in the group header
3. Fill in expense details:
   - Description (required)
   - Amount (required)
   - Date
   - Who paid (required)
   - Who shared the expense (required)

### Viewing Reports

Use the tabs in group detail view:

- **Transactions**: View all expenses by date
- **Total**: See total group spending
- **Balances**: Check who owes money and who should receive money
- **Export**: Future feature for data export

## Key Components Explained

### App.js

- Main application state management
- Handles data persistence with localStorage
- Manages navigation between views

### Storage Utils

- `saveToStorage()`: Save data to localStorage with error handling
- `loadFromStorage()`: Load data from localStorage with error handling
- `removeFromStorage()`: Remove specific keys
- `clearAllStorage()`: Clear all stored data

### Balance Calculation Logic

When an expense is added:

1. Person who paid gets credited with the full amount
2. All people sharing the expense get debited with their share
3. Final balance = Total paid - Total share

### State Management

- Users and groups are stored in React state
- Changes automatically sync to localStorage
- Data persists between browser sessions

## Future Enhancements

- [ ] Excel/CSV export functionality
- [ ] Edit/delete expenses
- [ ] User avatars
- [ ] Currency selection
- [ ] Settlement suggestions
- [ ] Expense categories
- [ ] Receipt image upload
- [ ] Push notifications

## Technologies Used

- React 18
- Tailwind CSS
- Lucide React (icons)
- localStorage API

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
