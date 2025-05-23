import Image from "next/image";
import React from "react";

const DecorationsPanel = ({
  decorations,
  decorationData,
  setDecorationData,
  deleteDecorationMode,
  setDeleteDecorationMode,
  onSelect,
}) => {
  const [scale, setScale] = React.useState(1);
  const [flip, setFlip] = React.useState(false);
  const [rotation, setRotation] = React.useState(0);

  const updateDecorationData = (dec) => {
    const newDecorationData = {
      ...decorationData,
      name: dec.name,
      imageUrl: dec.imageUrl,
      scale: scale,
      flip: flip,
      rotation: rotation,
    };
    console.log(newDecorationData);
    setDecorationData(newDecorationData);
  };

  React.useEffect(() => {
    console.log("hello");
    if (decorationData) {
      updateDecorationData(decorationData);
    }
  }, [scale, flip, rotation]);

  return (
    <div className="fixed top-20 right-4 bg-white p-4 rounded shadow-lg max-h-[80vh] overflow-y-auto">
      <h3 className="font-bold mb-2">Decorations</h3>
      <ul className="space-y-2">
        {decorations.map((dec, i) => (
          <li key={i}>
            <button
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
              onClick={() => onSelect(dec)}
            >
              <Image
                src={dec.imageUrl}
                alt={dec.name}
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <span>{dec.name}</span>
            </button>
          </li>
        ))}
      </ul>
      {/* inputs for scale, flip and rotation */}
      <div className="mt-4">
        <label className="block mb-2">Scale - {scale}</label>
        <input
          type="range"
          min={0.1}
          max={3}
          step={0.1}
          value={scale}
          onChange={(e) => setScale(e.target.value)}
          className="border rounded p-1 w-full"
        />
        <label className="block mb-2 mt-4">Flip</label>
        <input
          type="checkbox"
          checked={flip}
          onChange={(e) => setFlip(e.target.checked)}
          className="mr-2"
        />
        <label className="block mb-2 mt-4">Rotation - {rotation}</label>
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={rotation}
          onChange={(e) => setRotation(e.target.value)}
          className="border rounded p-1 w-full"
        />
        <button
          className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
          onClick={() => setDeleteDecorationMode(!deleteDecorationMode)}
        >
          {deleteDecorationMode ? "Cancel" : "Delete Decoration"}
        </button>
      </div>
    </div>
  );
};

export default DecorationsPanel;
