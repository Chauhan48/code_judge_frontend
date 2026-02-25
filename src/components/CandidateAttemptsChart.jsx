import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AttemptStatusChart({ candidates }) {
  const attempted = candidates.filter(c => c.attempts > 0).length;
  const notAttempted = candidates.filter(c => c.attempts === 0).length;

  const data = [
    { name: "Attempted", value: attempted },
    { name: "Not Attempted", value: notAttempted },
  ];

  const COLORS = ["#6366F1", "#EF4444"]; // Indigo & Red

  return (
    <div className="w-full max-w-xl mx-auto bg-gray-900 p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-semibold text-white text-center mb-6">
        Test Attempt Status
      </h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}