import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const Page = async () => {
  await dbConnect();
  const users = await User.find().lean();

  return (
    <div>
      <h1>All Names</h1>
      <ul>
        {users.map((u) => (
          <li key={u._id.toString()}>
            {u.firstName} {u.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
