import { Table } from "antd";
import dayjs from "dayjs";
import './style.css'
const ReportTable = ({ reportData }) =>{
    
    // this array of json objects define the structure of the table. 
    // For every data inside 'reportData' array, the table will add each of them based on this structure.

    const columns = [
        {
            title: 'Action',
            dataIndex: 'action',
        },
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
        },
        {
            title: 'Month, Year',
            dataIndex: 'monthYear',
        },
        {
            title: 'Dates Excluded',
            dataIndex: 'datesExcluded',
        },
        {
            title: 'Number of Days',
            dataIndex: 'numberOfDays',
        },
        {
            title: 'Lead Count',
            dataIndex: 'leadCount',
        },
        {
            title: 'Expected DRR',
            dataIndex: 'expectedDRR',
        },
        {
            title: 'Last Updated',
            dataIndex: 'lastUpdated',
            render: (date) => dayjs(date).format('YYYY-MM-DD[ ]HH:mm:ss'),
        }
    ]

    return (
        <Table className="myTable" columns={columns} dataSource={reportData}/>
    )
}

export default ReportTable;