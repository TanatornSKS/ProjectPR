const express = require("express");
const fs = require("fs");
const sql = require("mssql");

const router = express.Router();
const connectionString = fs.readFileSync("connection.txt", "utf8").trim();

router.get("/report/pr", async (req, res) => {
  try {
    const {
      prNumber = "",
      fromDate = "",
      toDate = "",
      page = 1,
      pageSize = 10
    } = req.query;

    const offset = (page - 1) * pageSize;
    const pool = await sql.connect(connectionString);
    const request = pool.request();

    let where = "WHERE 1=1";

    if (prNumber) {
      where += " AND prNumber LIKE @prNumber";
      request.input("prNumber", sql.VarChar, `%${prNumber}%`);
    }

    if (fromDate) {
      where += " AND pr_date >= @fromDate";
      request.input("fromDate", sql.Date, fromDate);
    }

    if (toDate) {
      where += " AND pr_date < DATEADD(DAY, 1, @toDate)";
      request.input("toDate", sql.Date, toDate);
    }

    /* ===== COUNT PR ===== */
    const countResult = await request.query(`
      SELECT COUNT(DISTINCT prNumber) AS total
      FROM t_matpr_db
      ${where}
    `);

    const total = countResult.recordset[0].total;

    /* ===== PAGE PR (เรียงใหม่ก่อน) ===== */
    const prPageResult = await request
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, Number(pageSize))
      .query(`
        SELECT prNumber, MAX(pr_date) AS pr_date
        FROM t_matpr_db
        ${where}
        GROUP BY prNumber
        ORDER BY MAX(pr_date) DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    const prList = prPageResult.recordset.map(r => r.prNumber);

    if (prList.length === 0) {
      return res.json({ data: [], total });
    }

    /* ===== LINE ITEMS (ใช้ filter เดิม) ===== */
    const dataResult = await pool.request()
      .input("fromDate", sql.Date, fromDate || null)
      .input("toDate", sql.Date, toDate || null)
      .query(`
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
        WHERE prNumber IN (${prList.map(p => `'${p}'`).join(",")})
        ${fromDate ? "AND pr_date >= @fromDate" : ""}
        ${toDate ? "AND pr_date < DATEADD(DAY, 1, @toDate)" : ""}
        ORDER BY pr_date DESC, prNumber DESC, line_item
      `);

    res.json({
      data: dataResult.recordset,
      total
    });

  } catch (err) {
    console.error("REPORT PR ERROR:", err);
    res.status(500).json({ data: [], total: 0 });
  }
});

module.exports = router;
