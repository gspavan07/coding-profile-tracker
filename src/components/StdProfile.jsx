import React from "react";
import { extractRating } from "../lib/utils";

const StdProfile = ({ selectedStudent, onClick }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#00000063]">
      <div className="bg-gray-800 flex flex-col justify-center items-center text-white p-6 rounded-lg min-w-96 max-w-3xl">
        <h2 className="text-xl font-bold mb-2 text-center underline">
          {selectedStudent.name}
        </h2>
        <p>
          {selectedStudent.roll} ({selectedStudent.branch})
        </p>
        <img
          src="img.jpg"
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
          <div className={selectedStudent.codechef.Username ? "" : "hidden"}>
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
          <div className={selectedStudent.codechef.Username ? "" : "hidden"}>
            <p className="underline">
              <strong> HackerRank</strong>
            </p>
            <div className="px-5">
              <p>
                <strong>Username:</strong>{" "}
                {selectedStudent.codechef["Username"]}
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
    </div>
  );
};

export default StdProfile;
