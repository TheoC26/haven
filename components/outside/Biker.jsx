"use client";
import React, { useEffect, useState } from "react";
import BikingPerson from "../svg/BikingPerson";
import useStateRef from "@/hooks/stateRef";

export const Biker = () => {
  const [bikingOffset, setBikingOffset] = useState({ x: 0, rotation: 0 });
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [prevScrollY, setPrevScrollY, prevScrollYRef] = useStateRef(0);

  // Move pathPoints outside the effect so we can use it in the render
  const pathPoints = [
    {
      x: 197,
      y: 982,
    },
    {
      x: 207.81275909050697,
      y: 962,
    },
    {
      x: 217.96789996514866,
      y: 942,
    },
    {
      x: 227.59627967072444,
      y: 922,
    },
    {
      x: 236.7276117937583,
      y: 902,
    },
    {
      x: 245.41076249006828,
      y: 882,
    },
    {
      x: 253.6533797968826,
      y: 862,
    },
    {
      x: 261.414783703341,
      y: 842,
    },
    {
      x: 268.64499530731233,
      y: 822,
    },
    {
      x: 275.2732746066758,
      y: 802,
    },
    {
      x: 281.21935238299073,
      y: 782,
    },
    {
      x: 286.37400902192566,
      y: 762,
    },
    {
      x: 290.63811482113916,
      y: 742,
    },
    {
      x: 293.93329126387626,
      y: 722,
    },
    {
      x: 296.17175080204176,
      y: 702,
    },
    {
      x: 297.18579598770976,
      y: 682,
    },
    {
      x: 296.94869834282595,
      y: 662,
    },
    {
      x: 295.3339188181141,
      y: 642,
    },
    {
      x: 292.2309354532486,
      y: 622,
    },
    {
      x: 287.38407773599656,
      y: 602,
    },
    {
      x: 280.7158003214233,
      y: 582,
    },
    {
      x: 272.39201444245734,
      y: 562,
    },
    {
      x: 262.3912303651664,
      y: 542,
    },
    {
      x: 250.5943004318599,
      y: 522,
    },
    {
      x: 236.97214086724655,
      y: 502,
    },
    {
      x: 221.64068080765448,
      y: 482,
    },
    {
      x: 204.7193777986188,
      y: 462,
    },
    {
      x: 186.25761927467828,
      y: 442,
    },
    {
      x: 166.92631953647896,
      y: 422,
    },
    {
      x: 147.80873991173108,
      y: 402,
    },
    {
      x: 130.50204932294137,
      y: 382,
    },
    {
      x: 115.88023752977984,
      y: 362,
    },
    {
      x: 103.96335850997744,
      y: 342,
    },
    {
      x: 94.16659095399422,
      y: 322,
    },
    {
      x: 87.17913245129929,
      y: 302,
    },
    {
      x: 83.10057153376214,
      y: 282,
    },
    {
      x: 82.42064399661274,
      y: 262,
    },
    {
      x: 85.15945018649143,
      y: 242,
    },
    {
      x: 90.57922566037243,
      y: 222,
    },
    {
      x: 97.85246152022726,
      y: 202,
    },
    {
      x: 106.72865539301454,
      y: 182,
    },
    {
      x: 116,
      y: 162,
    },
    {
      x: 124,
      y: 142,
    },
    {
      x: 133,
      y: 122,
    },
    {
      x: 143,
      y: 102,
    },
    {
      x: 152,
      y: 82,
    },
    {
      x: 160,
      y: 62,
    },
    {
      x: 172,
      y: 42,
    },
    {
      x: 183,
      y: 22,
    },
    {
      x: 197,
      y: -3,
    },
  ].reverse();

  useEffect(() => {
    const handleScroll = () => {
      // is scrolling up or down
      if (window.scrollY > prevScrollYRef.current) {
        setScaleX(-1);
      } else {
        setScaleX(1);
      }
      setPrevScrollY(window.scrollY);

      // Total height of the path
      const pathHeight = 982;

      // Calculate normalized scroll position (0 to 1)
      let normalizedScroll =
        ((window.scrollY + window.innerHeight / 2) % pathHeight) / pathHeight;

      // Calculate which segment we're on based on the total number of points
      const totalPoints = pathPoints.length - 1;
      const segment = Math.floor(normalizedScroll * totalPoints);

      // Calculate position within current segment (0 to 1)
      const segmentProgress = (normalizedScroll * totalPoints) % 1;

      // Get current and next points
      const currentPoint = pathPoints[segment];
      const nextPoint = pathPoints[Math.min(segment + 1, totalPoints)];

      // Linear interpolation between points
      let xOffset =
        currentPoint.x + (nextPoint.x - currentPoint.x) * segmentProgress;

      // Calculate rotation based on the angle between points
      const currentAngle =
        Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x) *
        (180 / Math.PI);
      const nextAngle =
        segment < totalPoints - 1
          ? Math.atan2(
              pathPoints[segment + 2].y - nextPoint.y,
              pathPoints[segment + 2].x - nextPoint.x
            ) *
            (180 / Math.PI)
          : currentAngle;
      const angle = currentAngle + (nextAngle - currentAngle) * segmentProgress;

      console.log(angle % 360 > 90);
      if (angle % 360 > 90) {
        setScaleY(-1);
      } else {
        setScaleY(1);
      }

      // Center the offset relative to the middle of the screen
      setBikingOffset({
        x: xOffset - 290,
        rotation: angle,
      });
    };
    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  //    make biker follow this svg path: <path d="M197 982C197 982 308.397 787.657 295 654.667C279.986 505.617 110.014 476.383 95 327.333C81.6034 194.343 195 -4.41922e-06 195 -4.41922e-06" stroke="black" stroke-width="186" stroke-linecap="square" stroke-linejoin="round" />

  return (
    <div className="fixed w-full h-full pointer-events-none">
      {/* <PathVisualizer points={pathPoints} /> */}
      <div
        className="fixed left-1/2 top-1/2 origin-bottom"
        style={{
          transform: `translateX(${bikingOffset.x}px) rotate(${bikingOffset.rotation}deg) `,
        }}
      >
        <BikingPerson
        className="transition-transform duration-150 origin-center"
          style={{
            transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
          }}
        />
      </div>
    </div>
  );
};
