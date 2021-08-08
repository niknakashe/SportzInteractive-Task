const mongoose = require("mongoose");

const connectDB = async () => {  
  const conn = await mongoose.connect(`${process.env.MONGOURI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`Mongodb connected to: ${conn.connection.host}`);
};

module.exports = connectDB;
