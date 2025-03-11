import { useState, useEffect } from "react";
import { Select, SelectItem } from "./components/Select";
import studentData from "./assets/students_profiles_updated.json";
import StdProfile from "./components/StdProfile";

function App() {
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortOrder, setSortOrder] = useState(null); // Default: No Sorting
  const branches = ["All", "AIML", "CSE", "ECE", "MECH", "EEE", "CIVIL"];

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
      leetcode: data.Profiles.LeetCode || {},
      performance: data.Profiles.Total_Score,
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

  // Apply sorting only if sortOrder is not null
  const sortedStudents = [...filteredStudents];
  if (sortOrder === "asc") {
    sortedStudents.sort((a, b) => a.performance - b.performance);
  } else if (sortOrder === "desc") {
    sortedStudents.sort((a, b) => b.performance - a.performance);
  }

  // Function to cycle sorting order: No Sorting → Ascending → Descending → No Sorting
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) =>
      prevOrder === null ? "asc" : prevOrder === "asc" ? "desc" : null
    );
  };

  return (
    <div className="flex flex-col w-full h-screen ">
      <nav className="w-full items-center  justify-between flex px-8 pt-6">
        <img src="au_logo.png" alt="" className="h-14" />
        <h1 className="font-bold text-4xl">Coding Profile Tracking System</h1>
        <div className="w-20"></div>
      </nav>
      <div className="flex p-6 gap-4 bg-white h-[91vh] text-black">
        {/* Left Side - Top Performers */}
        <div className="w-1/4 flex flex-col gap-6 h-full">
          {[
            { title: "Top 5 Performers", list: topPerformers.slice(0, 5) },
            { title: "Top 10 Performers", list: topPerformers.slice(0, 10) },
          ].map(({ title, list }) => (
            <div
              key={title}
              className="bg-gray-200 border-2 border-gray-400 shadow-lg text-black rounded-lg p-4 h-1/2 overflow-y-auto"
            >
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <ul>
                {list.map((student, index) => (
                  <li
                    key={index}
                    onClick={() => setSelectedStudent(student)}
                    className="  border-gray-600 p-2 cursor-pointer hover:text-blue-600"
                  >
                    {student.roll} ({student.performance.toFixed(1)})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right Side - Student Profiles */}
        <div className="w-3/4 bg-gray-200 border-2 border-gray-400  shadow-lg rounded-lg p-4 h-full overflow-y-auto">
          <div className="flex justify-between  items-center mb-4">
            <h2 className="text-2xl font-bold">Student Profiles</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by Roll No or Name"
                className="p-2 rounded bg-gray-300 text-black border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="border p-2 rounded bg-gray-300 text-black"
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
              <tr className="bg-gray-300 rounded-3xl text-black">
                <th className="p-2">S. NO</th>
                <th className="p-2">Roll No</th>
                <th className="p-2">Name</th>
                <th className="p-2">Branch</th>
                <th className="p-2 cursor-pointer" onClick={toggleSortOrder}>
                  Score{" "}
                  {sortOrder === "asc" ? "▲" : sortOrder === "desc" ? "▼" : "↕"}
                </th>
                <th className="p-2">Profile</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student, index) => (
                <tr key={index} className="border-b border-gray-600 text-black">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{student.roll}</td>
                  <td className="p-2">{student.name}</td>
                  <td className="p-2">{student.branch}</td>
                  <td className="p-2">{student.performance.toFixed(1)}</td>
                  <td className="p-2">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-blue-400 hover:underline cursor-pointer"
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
          <StdProfile
            selectedStudent={selectedStudent}
            onClick={() => setSelectedStudent(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
