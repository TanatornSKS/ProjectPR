// server/createpr.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const sql = require("mssql");


const connectionString = fs.readFileSync("connection.txt", "utf8").trim();

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

router.post("/prtemp", async (req, res) => {
  try {
    const {
      lineItem,
      material,
      Material_Description,
      qty,
      Base_Unit_of_Measure,
      Plant,
      Name_1
    } = req.body;

    console.log("INSERT:", req.body);

    const pool = await sql.connect(connectionString);

    await pool.request()
      .input("line_item", sql.VarChar, lineItem)
      .input("Material", sql.VarChar, material)
      .input("Material_Description", sql.VarChar, Material_Description)
      .input("qty", sql.Int, qty)
      .input("Base_Unit_of_Measure", sql.VarChar, Base_Unit_of_Measure)
      .input("Plant", sql.VarChar, Plant)
      .input("Name_1", sql.VarChar, Name_1)
      .query(`
        INSERT INTO t_matpr_temp
        (line_item, Material, Material_Description, qty,
         Base_Unit_of_Measure, Plant, Name_1)
        VALUES
        (@line_item, @Material, @Material_Description, @qty,
         @Base_Unit_of_Measure, @Plant, @Name_1)
      `);

    res.json({ success: true });

  } catch (err) {
    console.error("❌ PR TEMP ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


router.get("/prtemp", async (req, res) => {
  const { plant } = req.query;

  try {
    const pool = await sql.connect(connectionString);
    const result = await pool.request()
      .input("Plant", plant)
      .query(`
        SELECT *
        FROM t_matpr_temp
        WHERE Plant = @Plant
        ORDER BY line_item
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Select Error:", err);
    res.status(500).json([]);
  }
});


module.exports = router;
