import { useUserStore } from "@/stores/useUserStore";

export default function Settings() {
  const { user, updatePreferences } = useUserStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <label className="mt-6 flex max-w-xs flex-col gap-2">
        <span className="font-medium">Theme</span>
        <select
          value={user.preferences.theme}
          onChange={(event) =>
            updatePreferences({
              theme: event.target.value as 'light' | 'dark' | 'system',
            })
          }
          className="rounded-md border bg-background px-3 py-2"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    </div>
  );
}
