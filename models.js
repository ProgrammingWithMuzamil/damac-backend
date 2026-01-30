import { Sequelize, DataTypes } from 'sequelize';

// Sequelize Database Setup
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './damac.db',
    logging: false
});

// Define Models with automatic CRUD operations
const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    role: { type: DataTypes.STRING, defaultValue: 'user' }
}, {
    timestamps: true
});

const Property = sequelize.define('Property', {
    img: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.STRING, allowNull: false }
}, {
    timestamps: true
});

const Collaboration = sequelize.define('Collaboration', {
    img: { type: DataTypes.STRING, allowNull: false },
    logo: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    desc: { type: DataTypes.STRING, allowNull: false }
}, {
    timestamps: true
});

const Slide = sequelize.define('Slide', {
    img: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.JSON, allowNull: false }
}, {
    timestamps: true
});

const YourPerfect = sequelize.define('YourPerfect', {
    img: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.STRING, allowNull: false }
}, {
    timestamps: true
});

const SidebarCard = sequelize.define('SidebarCard', {
    img: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    desc: { type: DataTypes.STRING, allowNull: false }
}, {
    timestamps: true
});

const DAMAC = sequelize.define('DAMAC', {
    img: { type: DataTypes.STRING, allowNull: true },
    video: { type: DataTypes.STRING, allowNull: false }
}, {
    timestamps: true
});

const EmpoweringCommunities = sequelize.define('EmpoweringCommunities', {
    video: { type: DataTypes.STRING, allowNull: false }
}, {
    timestamps: true
});

export { User, Property, Collaboration, Slide, YourPerfect, SidebarCard, DAMAC, EmpoweringCommunities, sequelize };
