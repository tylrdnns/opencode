import { createSignal, onMount, Show, type Component } from "solid-js"
import { Tooltip } from "@opencode-ai/ui/tooltip"

interface UserInfo {
  name: string
  email: string
  username: string
}

export const UserMenu: Component = () => {
  const [user, setUser] = createSignal<UserInfo | null>(null)
  const [showMenu, setShowMenu] = createSignal(false)

  onMount(async () => {
    try {
      const resp = await fetch("/_platform/user")
      if (resp.ok) {
        const data = await resp.json()
        setUser(data)
      }
    } catch {}
  })

  const initials = () => {
    const u = user()
    if (!u) return ""
    const name = u.name || u.email
    const parts = name.split(/[\s@]/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <Show when={user()}>
      <div class="relative">
        <Tooltip placement="right" value={user()!.name || user()!.email}>
          <button
            class="size-8 rounded-md flex items-center justify-center hover:opacity-80 cursor-pointer"
            onClick={() => setShowMenu(!showMenu())}
            aria-label={`User: ${user()!.name || user()!.email}`}
          >
            <div
              class="size-5 rounded-full flex items-center justify-center text-[10px] font-semibold"
              style={{
                background: "var(--v2-background-bg-accent, #7aa2f7)",
                color: "var(--v2-background-bg-deep, #1a1b26)",
              }}
            >
              {initials()}
            </div>
          </button>
        </Tooltip>
        <Show when={showMenu()}>
          <div
            class="absolute left-12 bottom-0 z-50 min-w-[200px] rounded-lg border shadow-lg"
            style={{
              background: "var(--v2-background-bg-surface, #24283b)",
              "border-color": "var(--v2-border-border-subtle, #3b4261)",
            }}
          >
            <div class="px-3 py-2 border-b" style={{ "border-color": "var(--v2-border-border-subtle, #3b4261)" }}>
              <div class="text-sm font-medium" style={{ color: "var(--v2-text-text-base, #c0caf5)" }}>
                {user()!.name}
              </div>
              <div class="text-xs" style={{ color: "var(--v2-text-text-muted, #565f89)" }}>
                {user()!.email}
              </div>
            </div>
            <button
              class="w-full px-3 py-2 text-left text-sm hover:opacity-80 cursor-pointer"
              style={{ color: "var(--v2-text-text-base, #c0caf5)" }}
              onClick={() => {
                window.location.href = "/_platform/logout"
              }}
            >
              Sign out
            </button>
          </div>
        </Show>
      </div>
    </Show>
  )
}
