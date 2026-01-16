const express = require("express");
const fs = require("fs");
const sql = require("mssql");

const router = express.Router();
const connectionString = fs.readFileSync("connection.txt", "utf8").trim();

router.get("/report/pr", async (req, res) => {
  try {
    const pool = await sql.connect(connectionString);
    const result = await pool.request().query(`
      SELECT
        prNumber,
        CONVERT(varchar, pr_date, 120) AS pr_date,
        line_item,
        Material,
        Material_Description,
        qty,
        Base_Unit_of_Measure,
        Plant,
        Name_1
      FROM t_matpr_db
      ORDER BY pr_date DESC, prNumber, line_item
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ REPORT PR ERROR:", err);
    res.status(500).json([]);
  }
});

module.exports = router;
