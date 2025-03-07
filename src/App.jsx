import { useState, useEffect } from "react";
import { Card, CardContent } from "./components/Card";
import { Select, SelectItem } from "./components/Select";
import studentData from "./assets/students_profiles_with_branches.json";

function App() {
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const branches = ["All", "AIML", "CSE", "ECE", "MECH", "EEE", "CIVIL"];

  const extractRating = (rating) => {
    if (!rating || typeof rating !== "string") return 0; // Handle undefined/null values
    const match = rating.match(/\d+/); // Extract only numbers
    return match ? parseInt(match[0], 10) : 0; // Return number or 0 if not found
  };

  const calculatePerformance = (student) => {
    const gfgRating = extractRating(student.gfg.Rating);
    const codechefRating = extractRating(student.codechef.Rating);
    const hackerrankBadges = student.hackerrank.Badges || [];
    const hackerrankScore = hackerrankBadges.reduce(
      (acc, badge) => acc + badge.stars * 5,
      0
    );

    const averageRating = (gfgRating + codechefRating) / 2; // Average GFG and CodeChef Ratings
    return averageRating + hackerrankScore; // Total Performance Score
  };

  useEffect(() => {
    const profiles = studentData.Profiles || {};
    const formattedStudents = Object.entries(profiles).map(([roll, data]) => ({
      roll,
      name: data.Name,
      image: data.Image,
      branch: data.Branch,
      gfg: data.Profiles.GeeksForGeeks || {},
      codechef: data.Profiles.CodeChef || {},
      hackerrank: data.Profiles.HackerRank || {},
      performance: calculatePerformance({
        gfg: data.Profiles.GeeksForGeeks || {},
        codechef: data.Profiles.CodeChef || {},
        hackerrank: data.Profiles.HackerRank || {},
      }),
    }));

    setStudents(formattedStudents);
  }, []);

  const filteredStudents = students.filter((student) => {
    return (
      (selectedBranch === "All" || student.branch === selectedBranch) &&
      (student.roll.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const topPerformers = [...students]
    .filter((s) => s.performance > 0)
    .sort((a, b) => b.performance - a.performance);
  const top5 = topPerformers.slice(0, 5);
  const top10 = topPerformers.slice(0, 10);

  return (
    <div className="flex w-full h-screen p-6 gap-6 bg-gray-900 text-white">
      {/* Left Side - Top Performers */}
      <div className="w-1/4 flex flex-col gap-6 h-full">
        {[
          { title: "Top 5 Performers", list: topPerformers.slice(0, 5) },
          { title: "Top 10 Performers", list: topPerformers.slice(0, 10) },
        ].map(({ title, list }) => (
          <div
            key={title}
            className="bg-gray-800 shadow-lg rounded-lg p-4 h-1/2 overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <ul>
              {list.map((student, index) => (
                <li key={index} className="border-b border-gray-600 p-2">
                  {student.name} ({student.performance.toFixed(1)})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Right Side - Student Profiles */}
      <div className="w-3/4 bg-gray-800 shadow-lg rounded-lg p-6 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Student Profiles</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by Roll No or Name"
              className="p-2 rounded bg-gray-700 text-white border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="border p-2 rounded bg-gray-700 text-white"
            >
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="p-2">S. NO</th>
              <th className="p-2">Roll No</th>
              <th className="p-2">Name</th>
              <th className="p-2">Branch</th>
              <th className="p-2">GFG Rating</th>
              <th className="p-2">CodeChef Rating</th>
              <th className="p-2">HackerRank Badges</th>
              <th className="p-2">Profile</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={index} className="border-b border-gray-600 text-white">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{student.roll}</td>
                <td className="p-2">{student.name}</td>
                <td className="p-2">{student.branch}</td>
                <td className="p-2">{student.gfg["Rating"] || "N/A"}</td>
                <td className="p-2">
                  {extractRating(student.codechef.Rating)}
                </td>
                <td className="p-2">
                  {student.hackerrank.Badges?.map(
                    (b) => `${b.name} (${b.stars}⭐)`
                  ).join(", ") || "N/A"}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="text-blue-400 hover:underline"
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal Component */}
      {selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000063]">
          <div className="bg-gray-800 flex flex-col justify-center items-center text-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-2 text-center">
              {selectedStudent.name}
            </h2>
            <p>
              {selectedStudent.roll} ({selectedStudent.branch})
            </p>
            <img
              src="img.jpg"
              alt={selectedStudent.name}
              className="w-40 h-40 object-cover rounded-full mb-4"
            />
            <div className="w-full">
              <div>
                <p>
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
              <div
                className={selectedStudent.codechef.Username ? "" : "hidden"}
              >
                <p>
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
              <div
                className={selectedStudent.codechef.Username ? "" : "hidden"}
              >
                <p>
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
              onClick={() => setSelectedStudent(null)}
              className="mt-4 bg-red-500 text-white p-2 rounded w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
