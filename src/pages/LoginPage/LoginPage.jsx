export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Login to TalentFlow
        </h2>
        <form>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
          <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
