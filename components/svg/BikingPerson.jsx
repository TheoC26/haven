import * as React from "react";

const BikingPerson = ({className, style, color}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="68"
    height="98"
    fill="none"
    viewBox="0 0 68 98"
    className={className ? className : ""}
    style={style ? style : {}}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      d="m17.599 65.13 9.96-15.396m0 0 2.338-3.63-3.858-.554-1.053-.945m2.574 5.13 18.236-.135 5.816 15.504-16.98.512M27.56 49.734l7.072 15.882m0 0 13.044-18.558m0 0-2.499-.078m2.5.078 3.604-.088"
    ></path>
    <circle
      cx="17.599"
      cy="65.129"
      r="10"
      stroke="#000"
      strokeWidth="3"
      transform="rotate(-35.084 17.599 65.13)"
    ></circle>
    <circle
      cx="17.599"
      cy="65.129"
      r="1.5"
      stroke="#000"
      strokeWidth="2"
      transform="rotate(-35.084 17.599 65.13)"
    ></circle>
    <circle
      cx="51.612"
      cy="65.104"
      r="10"
      stroke="#000"
      strokeWidth="3"
      transform="rotate(-35.084 51.612 65.104)"
    ></circle>
    <circle
      cx="51.612"
      cy="65.104"
      r="1.5"
      stroke="#000"
      strokeWidth="2"
      transform="rotate(-35.084 51.612 65.104)"
    ></circle>
    <circle
      cx="34.798"
      cy="65.046"
      r="1"
      fill="#D9D9D9"
      stroke="#000"
      strokeWidth="2"
      transform="rotate(-35.084 34.798 65.046)"
    ></circle>
    <circle
      cx="39.454"
      cy="15.784"
      r="15"
      fill="#529C71"
      transform="rotate(-3.089 39.454 15.784)"
    ></circle>
    <path
      stroke="#529C71"
      strokeWidth="3"
      d="m43.016 26.107 1.928 7.907M35.131 65.59l1.904-11.119L49.06 45.31l-4.115-11.295m0 0-9.581 8.028-8.906 1.983m18.487-10.01-4.035 8.73-15.397 2.332"
    ></path>
  </svg>
);

export default BikingPerson;
