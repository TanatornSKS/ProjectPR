import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface Material {
  Plant: string;
  Name_1: string;
  Distribution_Channel: string;
  Material_Type: string;
  Material: string;
  Material_Description: string;
  Base_Unit_of_Measure: string;
  Material_Group: string;
  Material_grp_desc_2: string;
}

interface AddedMaterial extends Material {
  lineItem: string;
  qty: number;
}

const today = new Date().toISOString().split("T")[0];


const CreatePR: React.FC = () => {
  const [search, setSearch] = useState("");
  const [dataSource, setDataSource] = useState<Material[]>([]);
  const [added, setAdded] = useState<AddedMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQty, setSearchQty] = useState<Record<string, number>>({});
  const [docDate] = useState<string>(today); // ห้ามแก้
  const [deliveryDate, setDeliveryDate] = useState<string>(today);
  const [submitting, setSubmitting] = useState(false);
  const [resultMesge, setResultMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3001/api/t_Material");
        const json: Material[] = await res.json();
        setDataSource(json);
      } catch (err) {
        console.error(err);
        setDataSource([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ---------- Helpers ---------- */
  const generateLineItem = () => {
    const next = (added.length + 1) * 10;
    return next.toString().padStart(5, "0");
  };

  const handleSearchQtyChange = (material: string, value: number) => {
    setSearchQty(prev => ({
      ...prev,
      [material]: value < 1 ? 1 : value,
    }));
  };

  const handleAdd = (row: Material) => {
    if (added.find(a => a.Material === row.Material)) return;

    const qty = searchQty[row.Material] ?? 1;

    setAdded(prev => [
      ...prev,
      { ...row, lineItem: generateLineItem(), qty },
    ]);
  };

  const handleQtyChange = (index: number, value: number) => {
    setAdded(prev =>
      prev.map((row, i) =>
        i === index ? { ...row, qty: value < 1 ? 1 : value } : row
      )
    );
  };

  const handleSubmit = async () => {
    if (added.length === 0) {
      alert("No items added.");
      return;
    }
    setSubmitting(true);
    setResultMessage(null);
    setIsSuccess(null);
    try {
      const res = await fetch("http://localhost:3001/api/sap/createpr2sap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          docDate,
          deliveryDate,
          items: added
        })
      });
      const json = await res.json();

      if (json.success) {
        setIsSuccess(true);
        setResultMessage(`PR created successfully! PR Number: ${json.prNumber}`);
        setAdded([]); // clear table
      } else {
        setIsSuccess(false);
        setResultMessage(json.message);
      }
    } catch (err: any) {
      setIsSuccess(false);
      setResultMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = search.trim()
    ? dataSource.filter(item =>
      Object.values(item).some(val =>
        val.toString().toLowerCase().includes(search.toLowerCase())
      )
    )
    : [];

  /* ---------- Render ---------- */
  return (
    <div className="w-100">
       {resultMesge && (
                    <div
                      className={`alert mt-3 ${isSuccess ? "alert-success" : "alert-danger"
                        }`}
                    >
                      {resultMesge}
                    </div>
                  )}
      <div className="card shadow-sm w-100">
        <div className="card-header bg-warning d-flex justify-content-between">
          <h5 className="mb-0">Create PR</h5>
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: 220 }}
            placeholder="Search material..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : (
            <>
              {/* ---------- Search Result ---------- */}
              <div className="border rounded mb-4" style={{ maxHeight: 240, overflowY: "auto" }}>
                <table className="table table-bordered table-sm mb-0">
                  <thead className="table-dark sticky-top">
                    <tr>
                      <th>Material</th>
                      <th>Description</th>
                      <th style={{ width: 90 }}>QTY</th>
                      <th>Unit</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.Material}</td>
                          <td>{row.Material_Description}</td>
                          <td>
                            <input
                              type="number"
                              min={1}
                              className="form-control form-control-sm"
                              value={searchQty[row.Material] ?? 1}
                              onChange={e =>
                                handleSearchQtyChange(row.Material, Number(e.target.value))
                              }
                            />
                          </td>
                          <td>{row.Base_Unit_of_Measure}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleAdd(row)}
                            >
                              เพิ่ม
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-3">
                          พิมพ์ keyword เพื่อค้นหา Material
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ---------- Selected Items ---------- */}
              {added.length > 0 && (
                <>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label className="form-label fw-bold">Doc Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={docDate}
                        disabled
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-bold">Delivery Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={deliveryDate}
                        min={today}
                        onChange={e => setDeliveryDate(e.target.value)}
                      />
                    </div>
                  </div>


                  <table className="table table-bordered table-sm">
                    <thead className="table-dark">
                      <tr>
                        <th>Line Item</th>
                        <th>Material</th>
                        <th>Description</th>
                        <th style={{ width: 90 }}>QTY</th>
                        <th>Unit</th>
                        <th>Plant</th>
                        <th>Plant name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {added.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.lineItem}</td>
                          <td>{row.Material}</td>
                          <td>{row.Material_Description}</td>
                          <td>
                            <input
                              type="number"
                              min={1}
                              className="form-control form-control-sm"
                              value={row.qty}
                              onChange={e =>
                                handleQtyChange(idx, Number(e.target.value))
                              }
                            />
                          </td>
                          <td>{row.Base_Unit_of_Measure}</td>
                          <td>{row.Plant}</td>
                          <td>{row.Name_1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-end mt-3">
                    <button
                      className="btn btn-primary px-4"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "กำลังส่ง..." : "ส่ง"}
                    </button>
                  </div>
                 
                </>

              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePR;
