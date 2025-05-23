"use client";
import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";

const houseImages = [
  "/art/house/house1.png",
  "/art/house/house2.png",
  "/art/house/house3.png",
  "/art/house/house4.png",
];

const decorationImages = [
  //   "/art/decoration/flower.png", // placeholder
  "/art/decoration/tree.png", // placeholder
];

const Editor = () => {
  const canvasRef = useRef(null);
  const [objects, setObjects] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);

  const [selectedType, setSelectedType] = useState("house");
  const [selectedImage, setSelectedImage] = useState(houseImages[0]);

  const addObject = () => {
    setObjects((prev) => [
      ...prev,
      {
        type: selectedType,
        name: selectedType === "house" ? "New Club" : "Decoration",
        image: selectedImage,
        x: 100,
        y: 100,
      },
    ]);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const img = new Image();
      img.src = obj.image;
      if (x > obj.x && x < obj.x + 100 && y > obj.y && y < obj.y + 100) {
        setDraggingIndex(i);
        break;
      }
    }
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  const handleMouseMove = (e) => {
    if (draggingIndex !== null) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setObjects((prev) =>
        prev.map((obj, idx) => (idx === draggingIndex ? { ...obj, x, y } : obj))
      );
    }
  };

  const handleSave = () => {
    // mutliply the x and y by 20
    const objectsToSave = objects.map((obj) => ({
      ...obj,
      x: obj.x * 3,
      y: obj.y * 3,
    }));
    localStorage.setItem("levelData", JSON.stringify(objectsToSave));
    alert("Level saved!");
  };

  const drawCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (const obj of objects) {
      const img = new Image();
      img.src = obj.image;
      img.onload = () => {
        ctx.drawImage(img, obj.x, obj.y, 100, 100);
        if (obj.type === "house") {
          ctx.font = "16px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(obj.name, obj.x, obj.y - 10);
        }
      };
    }
  };

  useEffect(() => {
    // load objects the first time
    const savedObjects = localStorage.getItem("levelData");
    if (savedObjects) {
      setObjects(JSON.parse(savedObjects));
    }
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [objects]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Level Editor</h1>

      <div className="flex gap-4 mb-2">
        <select
          className="border px-2 py-1"
          onChange={(e) => {
            const type = e.target.value;
            setSelectedType(type);
            setSelectedImage(
              type === "house" ? houseImages[0] : decorationImages[0]
            );
          }}
        >
          <option value="house">House</option>
          <option value="decoration">Decoration</option>
        </select>

        <select
          className="border px-2 py-1"
          onChange={(e) => setSelectedImage(e.target.value)}
        >
          {(selectedType === "house" ? houseImages : decorationImages).map(
            (src, i) => (
              <option key={i} value={src}>
                {src.split("/").pop()}
              </option>
            )
          )}
        </select>

        <button
          className="bg-green-500 text-white px-3 py-1 rounded"
          onClick={addObject}
        >
          Add {selectedType}
        </button>

        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={handleSave}
        >
          Save Layout
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight*3}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="border w-full h-full"
      />
    </div>
  );
};

export default Editor;
