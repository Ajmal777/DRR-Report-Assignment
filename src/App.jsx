import React, { useState } from "react";
import "./App.css";
import AddNew from "./Components/AddNew";
import ReportTable from "./Components/ReportTable";
function App() {
  const [reportData, setReportData] = useState([]);

  return (
    <>
      <div className="main">
        <AddNew reportData={reportData} setReportData={setReportData}/>
        <ReportTable reportData={reportData} />
      </div>
    </>
  );
}

export default App;
