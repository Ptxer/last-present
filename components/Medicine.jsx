import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Taskbar from "@/components/Taskbar";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function MedicineComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pillStock, setPillStock] = useState([]);
  const [error, setError] = useState(null);
  const [PillList, setPillList] = useState("");
  const [pillName, setPillName] = useState("");
  const [dose, setDose] = useState("");
  const [typeName, setTypeName] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [total, setTotal] = useState("");
  const [unit, setUnit] = useState("");
  const [types, setTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedPillList, setSelectedPillList] = useState(null);
  const [selectedPill, setSelectedPill] = useState(null);
  const [expandedPillId, setExpandedPillId] = useState(null);
  const [selectedPillId, setSelectedPillId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPillStockPage, setCurrentPillStockPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session) {
      router.push("/");
      return;
    }

    fetchPillList();
    fetchData();
  }, [session, status, router]);

  useEffect(() => {
    fetchTypes();
    fetchUnits();
  }, []);

  const toggleExpand = (pillId) => {
    setExpandedPillId((prev) => (prev === pillId ? null : pillId));
  };

  const fetchPillList = async () => {
    try {
      const response = await fetch("/api/medicine/pill", { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPillList(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch("/api/medicine", { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPillStock(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await fetch("/api/medicine_type", { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTypes(data);
    } catch (err) {
      console.error("Error fetching types:", err);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/unit_type", { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUnits(data);
    } catch (err) {
      console.error("Error fetching units:", err);
    }
  };

  const handleSave = async () => {
    const formPill = {
      pillName,
      dose,
      typeName,
      expireDate,
      total,
      unit,
      status: 1,
    };

    try {
      const response = await fetch("/api/save_stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formPill),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Clear the form state to ensure a new pill ID is generated
      setPillName('');
      setDose('');
      setTypeName('');
      setExpireDate('');
      setTotal('');
      setUnit('');

      fetchData();
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  const handleSaveChanges = async () => {
    // ส่งค่าที่เลือกจาก dropdown เป็น type_id แทนที่จะเป็น type_name
    const response = await fetch("/api/save_medicine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pillName,
        dose,
        typeName: typeName, // ส่ง type_id (ไม่ใช่ชื่อประเภทยา)
        unit,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Pill added successfully", data);
      // รีเฟรชข้อมูล
      fetchPillList();
      fetchData();
    } else {
      console.error("Error adding pill:", data.error);
    }
  };

  const handleRemove = async (pillstock_id) => {
    try {
      const response = await fetch(`/api/medicine/${pillstock_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ total: 0 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setPillStock(
        pillStock.filter((item) => item.pillstock_id !== pillstock_id)
      );
    } catch (err) {
      console.error("Error removing data:", err);
    }
    fetchData();
    fetchPillList();
    fetchTypes();
    fetchUnits();
  };
  const handleEditClick = (pill) => {
    setSelectedPill(pill);
    setSelectedPillId(pill.pill_id);
    setPillName(pill.pill_name);
    setDose(pill.dose);
    setTypeName(pill.type_name);
    setExpireDate(
      pill.expire ? new Date(pill.expire).toISOString().split("T")[0] : ""
    );
    setTotal(pill.total);
    setUnit(pill.unit_type);
    console.log("Edit clicked:", pill);
  };

  const handleEditPill = async () => {
    // ตรวจสอบว่า selectedPill มี pillstock_id หรือไม่
    if (!selectedPill || !selectedPill.pillstock_id) {
      console.error("Selected pill is invalid or missing pillstock_id");
      return; // ไม่ดำเนินการต่อหากไม่มี pillstock_id
    }
  
    const formPill = {
      pillName,
      dose,
      typeName,
      expireDate,
      total: parseInt(total, 10),
      unit,
    };
  
    console.log("Sending data to server:", formPill);
    console.log("Request URL:", `/api/medicine/${selectedPill.pillstock_id}`);
  
    try {
      const response = await fetch(`/api/medicine/${selectedPill.pillstock_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formPill),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Data updated successfully:", data);
      // Refetch data to update UI
      fetchData();
    } catch (err) {
      console.error("Error updating data:", err);
    }
  
    fetchData();
    fetchPillList();
    fetchTypes();
    fetchUnits();
  };
  
  

  const handleUpdatePillList = async () => {
    const selectedUnit = units.find((unitItem) => unitItem.unit_type === unit); // หา unit_id จาก unit_type ที่เลือก
    const unitId = selectedUnit ? selectedUnit.unit_id : null;

    if (!unitId) {
      console.error("Unit ID not found");
      return;
    }

    const formPillList = {
      pillName,
      dose,
      typeName,
      unitId,
    };

    console.log("Sending an update to server:", formPillList);
    try {
      const response = await fetch(
        `/api/medicine/pill/${selectedPillList.pill_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formPillList),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data updated successfully:", data);
      fetchPillList(); // Refetch pill list to update UI
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
  useEffect(() => {
    fetchPillList();
  }, []);

  const handleRemovePillList = async (pill_id) => {
    try {
      // ส่ง PUT request ไปยัง backend เพื่ออัพเดต status เป็น 0
      const response = await fetch(`/api/medicine/pill/${pill_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: 0 }), // ส่ง status = 0 เพื่อทำการลบ
      });

      // เช็คว่า request สำเร็จหรือไม่
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // กรอง pillStock โดยลบรายการที่มี status = 0 ออก
      setPillStock((prevPillStock) =>
        prevPillStock.filter(
          (item) => item.pill_id !== pill_id || item.status !== 0
        )
      );
    } catch (err) {
      console.error("Error removing data:", err);
    }
    fetchData();
    fetchPillList();
    fetchTypes();
    fetchUnits();
  };

  if (status === "loading") {
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

  if (!session) {
    return null;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">Error: {error}</div>;
  }

  const handleEditPillList = (item) => {
    setSelectedPillList(item);
    setPillName(item.pill_name);
    setDose(item.dose);
    setTypeName(item.type_name);
    setUnit(item.unit_type);
  };

  const itemsPerPage = 10;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const filteredPills = Array.isArray(PillList)
    ? PillList.filter((pill) => pill.status === 1 && pill.pill_name.toLowerCase().startsWith(searchQuery.toLowerCase()))
    : [];
  const totalPages = Math.ceil(filteredPills.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentPills = filteredPills.slice(indexFirst, indexLast);

  const itemsStockPerPage = 5;

  const handlePillStockPageChange = (pageNumber) => {
    setCurrentPillStockPage(pageNumber);
  };

  const filteredPillStock = Array.isArray(pillStock)
    ? pillStock.filter((item) => item.pill_id === selectedPillId)
    : [];
  const totalPillStockPages = Math.ceil(
    filteredPillStock.length / itemsStockPerPage
  );
  const indexPillStockLast = currentPillStockPage * itemsStockPerPage;
  const indexPillStockFirst = indexPillStockLast - itemsStockPerPage;
  const currentPillStock = filteredPillStock.slice(
    indexPillStockFirst,
    indexPillStockLast
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar session={session} />
      <Taskbar />
      <main className="flex-1 p-5">
        <div className="flex justify-center items-start mt-10">
          <div className="w-full max-w-6xl bg-white shadow-md table-rounded">
            <div className="bg-blue-800 text-white p-4 flex items-center justify-between table-rounded">
              <h1 className="text-xl font-semibold">รายชื่อยาในระบบ</h1>
              <input
                type="text"
                placeholder="ค้นหายา..."
                className="border rounded px-4 py-2 w-full max-w-xs text-black"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="bg-green-600 text-white rounded"
                    onClick={() => {
                      setPillName(null);
                      setDose(null);
                      setTypeName(null);
                      setExpireDate(null);
                      setTotal(null);
                      setUnit(null);
                    }}
                  >
                    เพิ่มยา
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>เพิ่มยาใหม่</DialogTitle>
                    <DialogDescription>
                      กรอกข้อมูลรายละเอียดของยา และบันทึกข้อมูล
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        ชื่อยา
                      </Label>
                      <Input
                        id="name"
                        value={pillName}
                        onChange={(e) => setPillName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dose" className="text-right">
                        โดส
                      </Label>
                      <Input
                        id="dose"
                        value={dose}
                        onChange={(e) => setDose(e.target.value)}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="typeName" className="text-right">
                        ประเภทของยา
                      </Label>
                      <select
                        id="typeName"
                        value={typeName}
                        onChange={(e) => setTypeName(e.target.value)}
                        className="col-span-3 border rounded px-2 py-1"
                      >
                        <option value="">เลือกประเภทของยา</option>
                        {types.map((type) => (
                          <option key={type.type_id} value={type.type_id}>
                            {type.type_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="unit" className="text-right">
                        บรรจุภัณฑ์
                      </Label>
                      <select
                        id="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="col-span-3 border rounded px-2 py-1"
                      >
                        <option value="">Select Unit</option>
                        {units.map((unitItem) => (
                          <option
                            key={unitItem.unit_id}
                            value={unitItem.unit_type}
                          >
                            {unitItem.unit_type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        className="bg-green-600"
                        onClick={handleSaveChanges}
                      >
                        บันทึกข้อมูล
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>




            <table className="border-collapse border mx-auto w-full max-w-7xl">
              <thead>
                <tr className="border bg-gray-200">
                  <th className="border px-4 py-2">ไอดียา</th>
                  <th className="border px-4 py-2">ชิ่อยา</th>
                  <th className="border px-4 py-2">โดส</th>
                  <th className="border px-4 py-2">ประเภทของยา</th>
                  <th className="border px-4 py-2">บรรจุภัณฑ์</th>
                  <th className="border px-4 py-2">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {currentPills.length > 0 ? (
                  currentPills.map((pill, index) => (
                    <React.Fragment key={`${pill.pill_id}-${index}`}>
                      <tr
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={(e) => {
                          if (
                            !e.target.closest(".dialog") &&
                            !e.target.closest("button") &&
                            !e.target.closest("input") &&
                            !e.target.closest("select")
                          ) {
                            toggleExpand(pill.pill_id);
                            setSelectedPill(pill);
                            setSelectedPillId(pill.pill_id);
                            setPillName(pill.pill_name);
                            setDose(pill.dose);
                          }
                        }}
                      >
                        <td className="border px-4 py-2">{pill.pill_id}</td>
                        <td className="border px-4 py-2">{pill.pill_name}</td>
                        <td className="border px-4 py-2">{pill.dose}</td>
                        <td className="border px-4 py-2">{pill.type_name}</td>
                        <td className="border px-4 py-2">{pill.unit_type}</td>
                        <td className="border px-4 py-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="bg-yellow-400 text-white rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPillList(pill);
                                }}
                              >
                                แก้ไข
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>แก้ไขรายการยา</DialogTitle>
                                <DialogDescription>
                                  กรอกข้อมูลรายละเอียดของยาที่ต้องการแก้ไข
                                  และบันทึกข้อมูล
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="dose" className="text-right">
                                    ชื่อยา
                                  </Label>
                                  <Input
                                    id="pillName"
                                    value={pillName}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      setPillName(e.target.value);
                                    }}
                                    className="col-span-3"
                                  />
                                  <Label htmlFor="dose" className="text-right">
                                    โดส
                                  </Label>
                                  <Input
                                    id="dose"
                                    value={dose}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      setDose(e.target.value);
                                    }}
                                    className="col-span-3"
                                  />
                                  <Label htmlFor="dose" className="text-right">
                                    ประเภทของยา
                                  </Label>
                                  <select
                                    id="typeName"
                                    value={typeName}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      setTypeName(e.target.value);
                                    }}
                                    className="col-span-3 border rounded px-2 py-1"
                                  >
                                    <option value="">Select Type</option>
                                    {types.map((type) => (
                                      <option
                                        key={type.type_id}
                                        value={type.type_name}
                                      >
                                        {type.type_name}
                                      </option>
                                    ))}
                                  </select>
                                  <Label htmlFor="dose" className="text-right">
                                    บรรจุภัณฑ์
                                  </Label>
                                  <select
                                    id="unit"
                                    value={unit}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      setUnit(e.target.value);
                                    }}
                                    className="col-span-3 border rounded px-2 py-1"
                                  >
                                    <option value="">Select Unit</option>
                                    {units.map((unitItem) => (
                                      <option
                                        key={unitItem.unit_id}
                                        value={unitItem.unit_type}
                                      >
                                        {unitItem.unit_type}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <DialogFooter className="mt-4">
                                <DialogClose asChild>
                                  <Button
                                    className="green_button"
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdatePillList();
                                    }}
                                  >
                                    บันทึกข้อมูล
                                  </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button
                                    className="px-5 py-2 bg-red-600 text-white rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemovePillList(pill.pill_id);
                                    }}
                                  >
                                    ลบยา
                                  </Button>
                                </DialogClose>

                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                      {expandedPillId === pill.pill_id &&
                        selectedPillId === pill.pill_id &&
                        selectedPill.status === 1 && (
                          <tr className="bg-gray-50">
                            <td colSpan="6" className="border px-4 py-2">
                              <div className="flex justify-center items-start mt-3">
                                <div className="w-full max-w-6xl bg-white shadow-md table-rounded">
                                  <div className="bg-blue-800 text-white p-4 flex items-center justify-between table-rounded">
                                    <h1 className="text-xl font-semibold">
                                      รายการยาในคลัง
                                    </h1>

                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          className="bg-green-600 text-white rounded"
                                          onClick={() => {
                                            if (selectedPill) {
                                              setPillName(selectedPill.pill_name);
                                              setDose(selectedPill.dose);
                                              setTypeName(selectedPill.type_name);
                                              setUnit(selectedPill.unit_type);
                                            } else {
                                              console.error("No pill selected");
                                            }
                                          }}
                                        >
                                          เพิ่มสต็อกยา
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>เพิ่มยาเข้าสต็อก</DialogTitle>
                                          <DialogDescription>กรอกข้อมูลรายละเอียดของยา</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <label htmlFor="pillName" className="text-right">
                                              ชื่อยา
                                            </label>
                                            <span id="pillName" className="col-span-3 border rounded px-2 py-1">
                                              {pillName}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <label htmlFor="dose" className="text-right">
                                              โดส
                                            </label>
                                            <span id="dose" className="col-span-3 border rounded px-2 py-1">
                                              {dose}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <label htmlFor="typeName" className="text-right">
                                              ประเภทของยา
                                            </label>
                                            <span id="typeName" className="col-span-3 border rounded px-2 py-1">
                                              {typeName}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <label htmlFor="unit" className="text-right">
                                              บรรจุภัณฑ์
                                            </label>
                                            <span id="unit" className="col-span-3 border rounded px-2 py-1">
                                              {unit}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="total" className="text-right">
                                              จำนวน
                                            </Label>
                                            <Input
                                              id="total"
                                              type="number"
                                              value={total}
                                              onChange={(e) => setTotal(e.target.value)}
                                              className="col-span-3"
                                            />
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4 mt-4">
                                            <Label htmlFor="expire" className="text-right">
                                              วันหมดอายุ
                                            </Label>
                                            <Input
                                              type="date"
                                              id="expire"
                                              value={expireDate}
                                              onChange={(e) => setExpireDate(e.target.value)}
                                              className="col-span-3 border rounded px-2 py-1"
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter className="mt-4">
                                          <DialogClose asChild>
                                            <Button type="button" className="green_button" onClick={handleSave}>
                                              บันทึกข้อมูล
                                            </Button>
                                          </DialogClose>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>

                                  <table className="border-collapse border mx-auto w-full max-w-7xl">
                                    <thead>
                                      <tr className="border bg-gray-200">
                                        <th className="border px-4 py-2">
                                          รหัสสต็อกยา
                                        </th>
                                        <th className="border px-4 py-2">
                                          ชื่อยา
                                        </th>
                                        <th className="border px-4 py-2">
                                          โดส
                                        </th>
                                        <th className="border px-4 py-2">
                                          ประเภทของยา
                                        </th>
                                        <th className="border px-4 py-2">
                                          วันหมดอายุ
                                        </th>
                                        <th className="border px-4 py-2">
                                          จำนวน
                                        </th>
                                        <th className="border px-4 py-2">
                                          บรรจุภัณฑ์
                                        </th>
                                        <th className="border px-4 py-2 text-center items-center justify-center">
                                          ดำเนินการ
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {currentPillStock.length > 0 ? (
                                        // กรองรายการที่ total > 0 ก่อนแสดง
                                        currentPillStock.filter(item => item.total > 0).map((item) => (
                                          <tr
                                            key={item.pillstock_id}
                                            className={`border ${Number(item.total) <= 100
                                              ? "bg-red-500 text-red-500"
                                              : "bg-blue-100 text-black"
                                              }`}
                                          >
                                            <td className="border px-4 py-2">
                                              {item.pillstock_id}
                                            </td>
                                            <td className="border px-4 py-2">
                                              {item.pill_name}
                                            </td>
                                            <td className="border px-4 py-2">
                                              {item.dose}
                                            </td>
                                            <td className="border px-4 py-2">
                                              {item.type_name}
                                            </td>
                                            <td className="border px-4 py-2">
                                              {item.expire
                                                ? new Date(
                                                  item.expire
                                                ).toLocaleDateString()
                                                : "N/A"}
                                            </td>
                                            <td className="border px-4 py-2">
                                              {item.total}
                                            </td>
                                            <td className="border px-4 py-2">
                                              {item.unit_type}
                                            </td>
                                            <td className="border px-4 py-2 flex justify-center">
                                              <Dialog>
                                                <DialogTrigger asChild>
                                                  <Button
                                                    className="bg-yellow-400 text-white rounded"
                                                    onClick={() =>
                                                      handleEditClick(pill)
                                                    }
                                                  >
                                                    แก้ไขสต็อกยา
                                                  </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                  <DialogHeader>
                                                    <DialogTitle>
                                                      แก้ไขข้อมูลสต็อกยา
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                      แก้ไขข้อมูลสต็อกยาและบันทึกข้อมูล
                                                    </DialogDescription>
                                                  </DialogHeader>
                                                  <div className="grid gap-4 py-4">
                                                    <div className="grid mx-10 grid-cols-4 items-center gap-4">
                                                      <Label
                                                        htmlFor="name"
                                                        className="text-right"
                                                      >
                                                        ชื่อยา
                                                      </Label>
                                                      <span
                                                        id="name"
                                                        className="col-span-3"
                                                      >
                                                        {pillName}
                                                      </span>
                                                    </div>
                                                    <div className="grid mx-10 grid-cols-4 items-center gap-4">
                                                      <Label
                                                        htmlFor="dose"
                                                        className="text-right"
                                                      >
                                                        โดส
                                                      </Label>
                                                      <span
                                                        id="dose"
                                                        className="col-span-3"
                                                      >
                                                        {dose}
                                                      </span>
                                                    </div>
                                                    <div className="grid mx-10 grid-cols-4 items-center gap-4">
                                                      <Label
                                                        htmlFor="typeName"
                                                        className="text-right"
                                                      >
                                                        ประเภทของยา
                                                      </Label>
                                                      <span
                                                        id="typeName"
                                                        className="col-span-3"
                                                      >
                                                        {typeName}
                                                      </span>
                                                    </div>
                                                    <div className="grid mx-10 grid-cols-4 items-center gap-4">
                                                      <Label
                                                        htmlFor="unit"
                                                        className="text-right"
                                                      >
                                                        บรรจุภัณฑ์
                                                      </Label>
                                                      <span
                                                        id="unit"
                                                        className="col-span-3"
                                                      >
                                                        {unit}
                                                      </span>
                                                    </div>
                                                    <div className="grid mx-10 grid-cols-4 items-center gap-4">
                                                      <Label
                                                        htmlFor="total"
                                                        className="text-right"
                                                      >
                                                        จำนวน
                                                      </Label>
                                                      <Input
                                                        id="total"
                                                        type="number"
                                                        value={total}
                                                        onChange={(e) =>
                                                          setTotal(
                                                            e.target.value
                                                          )
                                                        }
                                                        className="col-span-3"
                                                      />
                                                    </div>
                                                    <div className="grid mx-10 grid-cols-4 items-center gap-4 mt-4">
                                                      <Label
                                                        htmlFor="expire"
                                                        className="text-right"
                                                      >
                                                        ว.ด.ป หมดอายุ
                                                      </Label>
                                                      <Input
                                                        type="date"
                                                        id="expire"
                                                        value={expireDate}
                                                        onChange={(e) =>
                                                          setExpireDate(
                                                            e.target.value
                                                          )
                                                        }
                                                        className="col-span-3 border rounded px-2 py-1"
                                                      />
                                                    </div>
                                                  </div>
                                                  <DialogFooter className="mt-4">
                                                    <DialogClose asChild>
                                                      <Button
                                                        type="button"
                                                        className="green_button"
                                                        onClick={handleEditPill}
                                                      >
                                                        บันทึกข้อมูล
                                                      </Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                      <Button
                                                        className="px-5 py-2 bg-red-600 text-white rounded"
                                                        onClick={() =>
                                                          handleRemove(
                                                            item.pillstock_id
                                                          )
                                                        }
                                                      >
                                                        ลบยา
                                                      </Button>
                                                    </DialogClose>
                                                  </DialogFooter>
                                                </DialogContent>
                                              </Dialog>
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td
                                            colSpan="8"
                                            className="text-center py-4"
                                          >
                                            <div className="flex justify-center items-center h-full">
                                              ไม่มียาในสต็อกยา
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>

                                  {totalPillStockPages > 1 && (
                                    <div className="flex justify-center my-2">
                                      {Array.from(
                                        { length: totalPillStockPages },
                                        (_, index) => (
                                          <button
                                            key={index}
                                            onClick={() =>
                                              handlePillStockPageChange(
                                                index + 1
                                              )
                                            }
                                            className={`mx-1 px-3 py-1 rounded ${currentPillStockPage === index + 1
                                              ? "bg-blue-500 text-white hover:bg-blue-700"
                                              : "bg-gray-300 hover:bg-gray-500"
                                              }`}
                                          >
                                            {index + 1}
                                          </button>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="flex justify-center items-center h-full">
                        ไม่มียาในสต็อกยา
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center my-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1
                      ? "bg-blue-500 text-white hover:bg-blue-700"
                      : "bg-gray-300 hover:bg-gray-500"
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
