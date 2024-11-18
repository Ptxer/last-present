"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PatientForm from "@/components/PatientForm";

const HealthForm = () => {
  return (
    <div className="flex flex-col justify-between h-screen m-0 p-0">
      <Navbar />
      <div className="flex-grow flex justify-center items-center bg-custom">
        <PatientForm />
      </div>
      <Footer />
    </div>
  );
};

export default HealthForm;
