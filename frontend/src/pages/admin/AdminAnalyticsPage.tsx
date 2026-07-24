import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getAvgAgeByCity,
  getUserCountByCity,
  getUsersCities,
} from "../../api/admin";
import type { AvgAgeByCity, CityUserRow, UserCountByCity } from "../../types";
import { extractApiError } from "../../utils/errors";

export function AdminAnalyticsPage() {
  const [counts, setCounts] = useState<UserCountByCity[]>([]);
  const [ages, setAges] = useState<AvgAgeByCity[]>([]);
  const [cities, setCities] = useState<CityUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [countData, ageData, cityData] = await Promise.all([
          getUserCountByCity(),
          getAvgAgeByCity(),
          getUsersCities(),
        ]);
        setCounts(countData);
        setAges(ageData);
        setCities(cityData);
      } catch (error) {
        toast.error(extractApiError(error));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const countChart = counts.map((row) => ({
    city: row._id,
    users: row.UsersCount,
  }));

  const ageChart = ages.map((row) => ({
    city: row._id,
    avgAge: Number(row.AvgUserAge.toFixed(1)),
  }));

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Aggregations</p>
          <h1>User analytics</h1>
        </div>
      </header>

      <div className="chart-grid">
        <section className="chart-panel">
          <h2>Users per city</h2>
          <p className="hint">GET /get_user_count → `_id`, `UsersCount`</p>
          {countChart.length === 0 ? (
            <p>No data</p>
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={countChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7d2c8" />
                  <XAxis dataKey="city" stroke="#5c574e" />
                  <YAxis allowDecimals={false} stroke="#5c574e" />
                  <Tooltip />
                  <Bar dataKey="users" fill="#0f6e56" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="chart-panel">
          <h2>Average age by city</h2>
          <p className="hint">GET /get_avg_age → `_id`, `AvgUserAge`</p>
          {ageChart.length === 0 ? (
            <p>No data</p>
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ageChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7d2c8" />
                  <XAxis dataKey="city" stroke="#5c574e" />
                  <YAxis stroke="#5c574e" />
                  <Tooltip />
                  <Bar dataKey="avgAge" fill="#c45c26" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <section className="chart-panel" style={{ marginTop: "1.5rem" }}>
        <h2>Users & cities</h2>
        <p className="hint">GET /get_users_cities</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((row, idx) => (
                <tr key={`${row.name}-${idx}`}>
                  <td>{row.name}</td>
                  <td>{row.age}</td>
                  <td>{row.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
