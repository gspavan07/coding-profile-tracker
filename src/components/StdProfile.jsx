import React from "react";

const StdProfile = ({ selectedStudent, onClick }) => {
  if (!selectedStudent) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#00000063]">
        <div className="bg-gray-800 text-white p-6 rounded-lg min-w-96 max-w-3xl text-center">
          <p className="text-xl font-bold">No student data available</p>
          <button
            onClick={onClick}
            className="mt-4 bg-red-500 text-white p-2 rounded w-full"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const extractRating = (rating) => {
    if (!rating || typeof rating !== "string") return 0;
    const match = rating.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const totalSolved =
    (selectedStudent.gfg?.["Problems Solved"] || 0) +
    (selectedStudent.codechef?.["Problems Solved"] || 0) +
    (selectedStudent.hackerrank?.["Problems Solved"] || 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#00000063] space-x-5">
      <div className="bg-gray-800 flex flex-col justify-center items-center text-white p-6 rounded-lg min-w-96 max-w-4xl">
        <h2 className="text-xl font-bold mb-2 text-center underline">
          {selectedStudent.name}
        </h2>
        <p>
          {selectedStudent.roll} ({selectedStudent.branch})
        </p>
        <img
          src={selectedStudent.image}
          alt={selectedStudent.name}
          className="w-40 h-40 object-cover rounded-full mb-4 "
        />

        <div className="w-full flex flex-1/3 un">
          <div>
            <p className="underline">
              <strong>GeekForGeeks</strong>
            </p>
            <div className="px-5">
              <p>
                <strong>Username:</strong>{" "}
                {selectedStudent.gfg["Username"] || "N/A"}
              </p>
              <p>
                <strong>Coding Score:</strong>{" "}
                {selectedStudent.gfg["Coding Score"] || "N/A"}
              </p>
              <p>
                <strong>Problems Solved:</strong>{" "}
                {selectedStudent.gfg["Problems Solved"] || "N/A"}
              </p>

              <p>
                <strong>Rating:</strong>{" "}
                {selectedStudent.gfg["Rating"] || "N/A"}
              </p>
            </div>
          </div>
          <div>
            <p className="underline">
              <strong>CodeChef</strong>
            </p>
            <div className="px-5">
              <p>
                <strong>Username:</strong>{" "}
                {selectedStudent.codechef["Username"]}
              </p>
              <p>
                <strong>Coding Score:</strong>{" "}
                {selectedStudent.codechef["Star"]}
              </p>
              <p>
                <strong>Rating:</strong>{" "}
                {extractRating(selectedStudent.codechef.Rating)}
              </p>
            </div>
          </div>
          <div className=" max-w-56">
            <p className="underline">
              <strong> HackerRank</strong>
            </p>
            <div className="px-5">
              <p>
                <strong>Username:</strong>{" "}
                {selectedStudent.hackerrank["Username"]}
              </p>
              <p>
                <strong> Badges:</strong>{" "}
                {selectedStudent.hackerrank.Badges?.map(
                  (b) => `${b.name} (${b.stars}⭐)`
                ).join(", ") || "N/A"}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onClick}
          className="mt-4 bg-red-500 text-white p-2 rounded w-full"
        >
          Close
        </button>
      </div>
      <div className="bg-gray-800 flex flex-col justify-center items-center text-white p-6 rounded-lg min-w-96 max-w-3xl">
        {/* Contest Rating Section */}
        <div className="bg-gray-700 p-4 rounded-lg text-center w-full mb-4">
          <p className="text-lg font-bold">Contest Rating</p>
          <p className="text-2xl font-extrabold">
            {selectedStudent.rating || "N/A"}
          </p>
          <p className="text-sm">
            Global Ranking: {selectedStudent.globalRanking || "N/A"}
          </p>
        </div>

        {/* Problem Solving Stats */}
        <div className="bg-gray-700 p-4 rounded-lg text-center w-full mb-4">
          <p className="text-lg font-bold">Total Problems Solved</p>
          <p className="text-3xl font-extrabold">{totalSolved}</p>
          <div className="flex justify-around mt-2">
            <p className="text-green-400">
              Easy: {selectedStudent.gfg?.["Easy"] || 0}
            </p>
            <p className="text-yellow-400">
              Med: {selectedStudent.gfg?.["Medium"] || 0}
            </p>
            <p className="text-red-400">
              Hard: {selectedStudent.gfg?.["Hard"] || 0}
            </p>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-gray-700 p-4 rounded-lg text-center w-full mb-4 max-w-md">
          <p className="text-lg font-bold">Badges</p>
          <p>
            {selectedStudent.hackerrank.Badges?.map(
              (b) => `${b.name} (${b.stars}⭐)`
            ) || "N/A"}
          </p>
        </div>

        {/* Language & Problem Solving Breakdown */}
        <div className="bg-gray-700 p-4 rounded-lg text-center w-full mb-4">
          <p className="text-lg font-bold">Languages</p>
          {selectedStudent.hackerrank.Badges?.map((b) => `${b.name} `).join(
            ", "
          ) || "N/A"}
        </div>
      </div>
    </div>
  );
};

export default StdProfile;
