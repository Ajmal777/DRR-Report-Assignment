import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Popconfirm, message } from "antd";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import "./style.css";
import TextArea from "antd/es/input/TextArea";

const { RangePicker } = DatePicker;

// Added a custom Join method so that, the excluded Dates list gets converted to
// the desired format. Which can be later used to display or add to the table.

Array.prototype.customJoin = function (s) {
  let string = "";
  for (const date of this) {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    string += formattedDate + s;
  }
  return string.slice(0, string.length - s.length);
};

const AddNew = ({ reportData, setReportData }) => {
  const [date, setDate] = useState(null);
  const [disable, setDisable] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [excludedDate, setExcludedDate] = useState("");
  const [excludedDateList, setExcludedDateList] = useState([]);
  const [excludedDateListString, setExcludedDateListString] = useState("N/A");
  const [leadCount, setLeadCount] = useState("");
  const [expectedDRR, setExpectedDRR] = useState("");

  // As the name says, this function is used to show the modal, in which all the input fields to add a new data are there.
  const showModal = () => {
    setIsModalOpen(true);
  };

  // This function is used to combine all the data that the user entered into a JSON object,
  // and then "setReportData" function is called which sets the state in App.jsx file which can then be forwarded to the table component.
  // at the "resetForm" function will reset all the input fields.
  const handleSubmit = () => {
    const data = {
      action: "N/A",
      id: null,
      startDate: dayjs(date[0]).format("YYYY-MM-DD"),
      endDate: dayjs(date[1]).format("YYYY-MM-DD"),
      monthYear: `${date[1].month() + 1}, ${date[1].year()}`,
      datesExcluded: excludedDateListString,
      numberOfDays: date[1].diff(date[0], "day") + 1 - excludedDateList.length,
      leadCount: leadCount,
      expectedDRR: expectedDRR,
      lastUpdated: new Date(),
    };
    setReportData([...reportData, data]);
    setIsModalOpen(false);

    resetForm();
  };

  // This function closes the modal when the cancel button is clicked.
  const handleCancel = () => {
    resetForm();
    setIsModalOpen(false);
  };

  // This function is triggered when the user clicks on "Yes" button on the pop-confirm object.
  // This function is called to convert the excluded dates list to a string which can be shown to the user in
  // an input field.
  const confirm = () => {
    setExcludedDate("");
    addToExcludedDateList();
    message.success("Done");
  };

  // This useEffect runs as soon as excludedDateList gets updated, to avoid bugs caused by
  // continuous asynchronous method calls.
  useEffect(() => {
    setExcludedDateListString(excludedDateList.customJoin(", "));
  }, [excludedDateList]);

  // This function is used to disable the dates based on different conditions.
  // this function returns a boolean value which tells the ant design date picker component whether or not
  // to disable the date.
  const disabledDate = (current) => {
    // This piece of code is used to disable all the dates that are
    // excluded by the user. i.e. the user cannot select an already excluded date again.
    if (excludedDateList.length > 0) {
      for (const date of excludedDateList) {
        if (date.isSame(current)) return true;
      }
    }

    // This code will disable all the dates that come before the start date ( date[0] ), or
    // all the dates that comes after end date ( date[1] )
    return (
      current &&
      (date[0].diff(current) > 0 || current.isAfter(date[1].add(1, "day")))
    );
  };

  // this method disables all the date that come before the present date.
  // This is to prevent users from selecting date that has already been passed.
  const disablePrevDates = (current) => {
    return current && current.isBefore(dayjs().subtract(1, "day"));
  };

  // this method gets triggered whenever the date picker changes.
  // i.e. when the user selects a start date and an end date, this function is called.
  function getDate(e) {
    if (!e) return;
    setDate([e[0], e[1]]);

    // this method controls whether the exclude date input should be disabled
    // or not. This is to prevent users from excluding dates before the user
    // picks a start and end date.
    setDisable(false);
  }

  // This function is triggered as soon as the user selects a date to exclude
  function getExcludedDate(e) {
    if (!e) return;
    setExcludedDate(e);
  }

  // This function gets called when the user clicks on the "Add" button next
  // to the exclude date date-picker.
  function addToExcludedDateList() {
    // This code first spreads the already existing excludedDataList, and then adds
    // the new value into it, then returns the new array.
    setExcludedDateList((excludedDateList) =>
      [...excludedDateList, excludedDate].sort((a, b) => {
        if (b.isBefore(a)) return 1;
        else return -1;
      })
    );
  }

  // whenever the user enters lead count, this method gets called which calculates the DRR.
  // The DRR is calculated using this formula: (number of days - excluded days) / lead count.
  // .diff() is a method fron dayjs package which gives the difference between two dates.
  function handleLeadChange(e) {
    const DRR = Math.floor(
      e.target.value /
        (date[1].diff(date[0], "day") - excludedDateList.length + 1)
    );

    // This ternary operator is used to avoid incorrect results caused by "division by 0" bug.
    updateDRR(DRR === Infinity ? 0 : DRR);
    setLeadCount(e.target.value);
  }

  // this method updates the expectedDRR state which is later used to display the DRR in the input field,
  // as well as in the data object which is passed to the table component.
  function updateDRR(val) {
    setExpectedDRR(val);
  }

  // This function resets all the input fields to default after the user successfully submits the data.
  function resetForm() {
    setDate(null);
    setLeadCount("");
    setExpectedDRR("");
    setExcludedDate(null);
    setExcludedDateList([]);
    setExcludedDateListString("N/A");
  }

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Add new
      </Button>
      <Modal
        title="Add new report"
        open={isModalOpen}
        okText="Save"
        onOk={handleSubmit}
        cancelButtonProps={{
          danger: true,
        }}
        okButtonProps={{
          style: {
            backgroundColor: "#079c07",
          },
        }}
        onCancel={handleCancel}
      >
        <Form layout="vertical">
          <Form.Item label="Select start and end dates: ">
            <RangePicker
              id="selectDate"
              disabledDate={disablePrevDates}
              onChange={getDate}
              value={date}
            />
          </Form.Item>
          <Form.Item>
            <Input
              placeholder="Month, Year will show here"
              style={{ color: "#606060" }}
              value={
                date
                  ? `Month: ${date[1].month() + 1}, Year: ${date[1].year()}`
                  : ""
              }
              disabled
            />
          </Form.Item>
          <Form.Item name="excludedDate" label="Exclude date: ">
            <DatePicker
              format="YYYY-MM-DD"
              disabledDate={disabledDate}
              onChange={getExcludedDate}
              disabled={disable}
              value={excludedDate}
            />
            <Popconfirm
              title="Exclude this date"
              description="Are you sure you want to exclude this date?"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" disabled={excludedDate ? false : true}>
                Add
              </Button>
            </Popconfirm>
          </Form.Item>
          <Form.Item>
            <TextArea
              placeholder="Excluded dates will show here"
              value={excludedDateListString}
              style={{ color: "#606060" }}
              autoSize
              disabled
            />
          </Form.Item>
          <Form.Item label="Lead Count">
            <Input
              placeholder="Enter lead count"
              value={leadCount}
              onChange={handleLeadChange}
            />
          </Form.Item>
          <Form.Item>
            <Input
              placeholder="Expected DRR"
              value={expectedDRR}
              style={{ color: "#606060" }}
              disabled
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default AddNew;
