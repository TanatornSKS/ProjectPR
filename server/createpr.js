// server/createpr.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const sql = require("mssql");

// อ่าน connection string
const connectionString = fs.readFileSync("connection.txt", "utf8").trim();

// Route /t_Material
router.get("/t_Material", async (req, res) => {
  try {
    const pool = await sql.connect(connectionString);
    const result = await pool.request().query(`
     SELECT Plant, Name_1, Storage_Location, Sales_Organization, Distribution_Channel, Material_Type,
             Material, Material_Description, Base_Unit_of_Measure, Price_Control, Moving_price, Currency,
             Standard_price, Currency2, Price_Material, Gross_Weight, Weight_unit, Net_Weight, Weight_unit2,
             Transportation_Group, Loading_Group, Item_category_group, Material_Group, Material_grp_desc_2
      FROM t_Material
      WHERE Plant = '1021'
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).send("Database error: " + err.message);
  }
});

module.exports = router;
