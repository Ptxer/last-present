"use client";

import React, { useState, useEffect } from "react";
import Taskbar from "@/components/Taskbar";
import Report from "@/components/Report";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const fetchTickets = async (setTickets, setError) => {
  try {
    const response = await fetch("/api/dashboard");
    const data = await response.json();
    if (response.ok) {
      setTickets(data || []);
    } else {
      setError(data.error || "Failed to fetch tickets");
    }
  } catch (error) {
    setError("Error fetching tickets");
    console.error("Error fetching tickets:", error);
  }
};

const formatDate = (datetime) => {
  const date = new Date(datetime);
  const dateString = date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeString = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateString}\nเวลา ${timeString}`;
};

export default function HistoryComponent() {
  const [reportLoading, setReportLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets(setTickets, setError);
    setTimeout(() => {
      setReportLoading(false);
    }, 2000);

    setTimeout(() => {
      setHistoryLoading(false);
    }, 2000);

  }, []);

  // Filter tickets to show only those with status 0
  const finishedTickets = tickets.filter((ticket) => ticket.status === 0);

  // Filter tickets based on search query
  const filteredTickets = finishedTickets.filter(
    (ticket) =>
      ticket.patient_id.includes(searchQuery) ||
      ticket.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (reportLoading || historyLoading) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700">
        <div className="flex items-center justify-center">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      </div>
    );
}

  return (
    <div>
      <div>
        <Taskbar />
        <Report />
        <div className="min-h-screen bg-gray-100 flex justify-center p-8">
          <div className="w-full max-w-5xl bg-white shadow-md rounded-lg">
            <div className="bg-blue-800 text-white p-4 flex items-center justify-between rounded-t-lg">
              <h1 className="text-xl font-semibold mx-10">ประวัตินักศึกษา</h1>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="search"
                  className="text-black ml-4 px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-center">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="py-2 px-4 border-b text-center">
                    รหัสนักศึกษา
                  </th>
                  <th className="py-2 px-4 border-b text-center">สถานะ</th>
                  <th className="py-2 px-4 border-b text-center">
                    วันที่และเวลา
                  </th>
                  <th className="py-2 px-4 border-b text-center">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.patientrecord_id}
                      className="border bg-green-100 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg"
                    >
                      <td className="py-2 px-4 border-b text-center">
                        {ticket.patient_name}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {ticket.patient_id}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {ticket.role}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {new Date(ticket.datetime).toLocaleString()}
                      </td>
                      <Dialog className="">
                        <DialogTrigger asChild>
                          <td className="py-2 px-4 border-b text-blue-700 cursor-pointer text-center">
                            ดูข้อมูล
                          </td>
                        </DialogTrigger>
                        <DialogContent className="w-full">
                          <DialogHeader>
                            <DialogTitle>Patient Ticket</DialogTitle>
                            <DialogDescription>
                              Status: Finished
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-1">
                            <div>
                              <h3 className="ml-10 text-lg">ชื่อ-นามสกุล</h3>
                              <div className="ml-16">{ticket.patient_name}</div>
                            </div>
                            <div>
                              <h3 className="ml-10 text-lg">รหัสนักศึกษา</h3>
                              <div className="ml-16">{ticket.patient_id}</div>
                            </div>
                            <div>
                              <h3 className="ml-10 text-lg">เวลาเช็คอิน</h3>
                              <div className="ml-16">
                                {formatDate(ticket.datetime)}
                              </div>
                            </div>
                            <br />
                            <h3 className="ml-10 text-lg">อาการของผู้ป่วย</h3>
                            {ticket.symptom_names ? (
                              <div className="ml-10 space-y-2 text-lg">
                                <p className="ml-10">
                                  {ticket.symptom_names
                                    .split(",")
                                    .map((symptom) => symptom.trim())
                                    .join(", ")}
                                </p>
                              </div>
                            ) : (
                              <p className="ml-10 text-lg">
                                ไม่มีอาการที่บันทึกไว้
                              </p>
                            )}
                            {ticket.other_symptoms && (
                              <div className="ml-10 mt-2">
                                <h3>หมายเหตุ</h3>
                                <div className="space-y-2 ml-10">
                                  {ticket.other_symptoms
                                    .split(",")
                                    .map((symptom, index) => (
                                      <p key={index}>{symptom.trim()}</p>
                                    ))}
                                </div>
                              </div>
                            )}

                            {ticket.pill_quantities && (
                              <div className="mt-2">
                                <div className="space-y-2 bg-blue-800">
                                  <table className="border-collapse border mx-auto w-full max-w-4xl">
                                    <thead>
                                      <h3 className="text-xl font-semibold py-2 text-white bg-blue-800 text-center">
                                        บันทึกยา
                                      </h3>
                                      <tr className="border bg-gray-200">
                                        <th className="border px-4 py-2">
                                        ไอดียา
                                        </th>
                                        <th className="border px-4 py-2">
                                          ชื่อยา
                                        </th>
                                        <th className="border px-4 py-2">
                                          จำนวน
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {ticket.pill_quantities
                                        .split(",")
                                        .map((quantity, index) => (
                                          <tr key={index}>
                                            <td className="border px-4 py-2">
                                              {ticket.pillstock_ids
                                                ? ticket.pillstock_ids.split(
                                                    ","
                                                  )[index]
                                                : "Unknown"}
                                            </td>
                                            <td className="border px-4 py-2">
                                              {ticket.pill_names
                                                ? ticket.pill_names.split(",")[
                                                    index
                                                  ]
                                                : "Unknown"}
                                            </td>
                                            <td className="border px-4 py-2">
                                              {quantity.trim()}{" "}
                                              {ticket.unit_type}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                ปิด
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No patient listed currently.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}