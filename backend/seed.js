const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Department = require('./models/Department');

dotenv.config();

const categories = [
  { name: 'Computers', description: 'Laptops, Desktops, and Workstations' },
  { name: 'Studio Equipment', description: 'Cameras, Microphones, Lighting' },
  { name: 'Network Equipment', description: 'Routers, Switches, Access Points' },
  { name: 'Peripherals', description: 'Monitors, Keyboards, Mice, Headsets' },
  { name: 'Mobile Devices', description: 'Phones, Tablets' },
  { name: 'Office Equipment', description: 'Printers, Scanners, Projectors' },
  { name: 'Software Licenses', description: 'Software and Application Licenses' },
];

const departments = [
  { name: 'IT Department', location: 'Building A, Floor 2' },
  { name: 'Studio Production', location: 'Building B, Floor 1' },
  { name: 'Administration', location: 'Building A, Floor 1' },
  { name: 'Development', location: 'Building A, Floor 3' },
];

const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin',
    employeeId: 'EMP001',
  },
  {
    firstName: 'John',
    lastName: 'Manager',
    email: 'manager@company.com',
    password: 'manager123',
    role: 'manager',
    employeeId: 'EMP002',
  },
  {
    firstName: 'Jane',
    lastName: 'Employee',
    email: 'employee@company.com',
    password: 'employee123',
    role: 'employee',
    employeeId: 'EMP003',
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Department.deleteMany({});

    // Create departments
    console.log('Creating departments...');
    const createdDepartments = await Department.insertMany(departments);
    console.log(`✓ Created ${createdDepartments.length} departments`);

    // Create categories
    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✓ Created ${createdCategories.length} categories`);

    // Create users with department references (one by one to trigger password hashing)
    console.log('Creating users...');
    const createdUsers = [];
    for (let i = 0; i < users.length; i++) {
      const userData = {
        ...users[i],
        department: createdDepartments[i % createdDepartments.length]._id,
      };
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`✓ Created ${createdUsers.length} users`);

    console.log('\n================================');
    console.log('Database seeded successfully!');
    console.log('================================\n');
    console.log('Login credentials:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Manager: manager@company.com / manager123');
    console.log('Employee: employee@company.com / employee123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
