const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Employee = require("../models/Employee");

const resolvers = {
  Query: {
    hello: () => "GraphQL server working successfully",

    getEmployees: async () => {
      const employees = await Employee.find().sort({ createdAt: -1 });
      return employees;
    },

    searchEmployeeById: async (_, { id }) => {
      const employee = await Employee.findById(id);
      if (!employee) {
        throw new Error("Employee not found.");
      }
      return employee;
    },

    searchEmployeeByDesignationOrDepartment: async (_, { designation, department }) => {
      if ((!designation || !designation.trim()) && (!department || !department.trim())) {
        throw new Error("Please provide designation or department.");
      }

      const filters = [];

      if (designation && designation.trim()) {
        filters.push({ designation: { $regex: designation.trim(), $options: "i" } });
      }

      if (department && department.trim()) {
        filters.push({ department: { $regex: department.trim(), $options: "i" } });
      }

      const employees = await Employee.find({ $or: filters }).sort({ createdAt: -1 });
      return employees;
    },
  },

  Mutation: {
    signup: async (_, { username, email, password }) => {
      if (!username.trim() || !email.trim() || !password.trim()) {
        throw new Error("All fields are required.");
      }

      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        throw new Error("Username or email already exists.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      return user;
    },

    login: async (_, { usernameOrEmail, password }) => {
      const user = await User.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });

      if (!user) {
        throw new Error("Invalid credentials.");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid credentials.");
      }

      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      return { token, user };
    },

    addEmployee: async (
      _,
      {
        first_name,
        last_name,
        email,
        gender,
        designation,
        salary,
        date_of_joining,
        department,
        employee_photo,
      }
    ) => {
      if (!first_name?.trim()) throw new Error("first_name is required.");
      if (!last_name?.trim()) throw new Error("last_name is required.");
      if (!email?.trim()) throw new Error("email is required.");
      if (!gender?.trim()) throw new Error("gender is required.");
      if (!designation?.trim()) throw new Error("designation is required.");
      if (salary === undefined || salary === null) throw new Error("salary is required.");
      if (!date_of_joining?.trim()) throw new Error("date_of_joining is required.");
      if (!department?.trim()) throw new Error("department is required.");

      const existing = await Employee.findOne({ email });
      if (existing) {
        throw new Error("Employee email already exists.");
      }

      const employee = await Employee.create({
        first_name,
        last_name,
        email,
        gender,
        designation,
        salary,
        date_of_joining: new Date(date_of_joining),
        department,
        employee_photo: employee_photo || "",
      });

      return employee;
    },

    updateEmployee: async (_, args) => {
      const { id, ...updates } = args;

      const employee = await Employee.findById(id);
      if (!employee) {
        throw new Error("Employee not found.");
      }

      if (updates.email && updates.email.trim() && updates.email !== employee.email) {
        const emailExists = await Employee.findOne({ email: updates.email.trim() });
        if (emailExists) {
          throw new Error("Employee email already exists.");
        }
      }

      Object.keys(updates).forEach((key) => {
        const value = updates[key];

        if (value === undefined || value === null) return;

        if (typeof value === "string") {
          if (!value.trim()) return;
          employee[key] = value.trim();
        } else {
          employee[key] = value;
        }
      });

      if (updates.date_of_joining && updates.date_of_joining.trim()) {
        employee.date_of_joining = new Date(updates.date_of_joining.trim());
      }

      await employee.save();
      return employee;
    },

    deleteEmployee: async (_, { id }) => {
      const employee = await Employee.findById(id);
      if (!employee) {
        throw new Error("Employee not found.");
      }

      await Employee.findByIdAndDelete(id);
      return "Employee deleted successfully.";
    },
  },
};

module.exports = resolvers;