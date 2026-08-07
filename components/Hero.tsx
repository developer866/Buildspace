"use client"
import React from "react";

// import Image from "next/image";
import Button from "@/ui/Buttons";

function Hero() {
  const handleclick = () =>{
    return(
      console.log("hello world")
    )
  }
  return (
    <main className="flex justify-between">
      <div className=" border w-2/3 p-4">
        <h1 className="text-6xl">Welcome To Football cv</h1>
        <p>
          Where you just have to drop your details and we create a football cv
          for you in jpeg format or pdfs
        </p>
        <Button text="Get your cv" onClick={handleclick} variant="secondary"/>
      </div>
      <div className="">
        <p>Image</p>
      {/* <Image src={""}  alt="image"/> */}
      </div>
    </main>
  );
}

export default Hero;  
