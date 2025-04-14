// import React from "react";

const EmptyCard = ({ imgsrc, message }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-64">
      {/* <img src="imgsrc" alt="No Notes" className="w-60" /> */}
      <p className="w-1/2 text-xl font-medium text-slate-700 text-center leading-7 mt-16">
        {message}
      </p>
    </div>
  );
};

export default EmptyCard;
