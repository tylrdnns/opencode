import { createSignal, onCleanup, onMount, Show, type Component } from "solid-js"
import { Portal } from "solid-js/web"
import { Tooltip } from "@opencode-ai/ui/tooltip"

interface UserInfo {
  name: string
  email: string
  username: string
}

export const UserMenu: Component = () => {
  const [user, setUser] = createSignal<UserInfo | null>(null)
  const [showMenu, setShowMenu] = createSignal(false)
  const [menuPos, setMenuPos] = createSignal({ bottom: 80, left: 56 })
  let triggerRef: HTMLButtonElement | undefined

  const closeMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest("[data-user-menu]")) setShowMenu(false)
  }
  onMount(() => document.addEventListener("click", closeMenu))
  onCleanup(() => document.removeEventListener("click", closeMenu))

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

  const toggleMenu = () => {
    if (!showMenu() && triggerRef) {
      const rect = triggerRef.getBoundingClientRect()
      setMenuPos({
        bottom: window.innerHeight - rect.top + 4,
        left: rect.right + 8,
      })
    }
    setShowMenu(!showMenu())
  }

  return (
    <Show when={user()}>
      <div class="relative" data-user-menu>
        <Tooltip placement="right" value={user()!.name || user()!.email}>
          <button
            ref={triggerRef}
            class="size-8 rounded-md flex items-center justify-center hover:opacity-80 cursor-pointer"
            onClick={toggleMenu}
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
          <Portal>
            <div
              data-user-menu
              class="fixed z-[99999] min-w-[200px] rounded-lg border shadow-lg"
              style={{
                background: "var(--v2-background-bg-surface, #24283b)",
                "border-color": "var(--v2-border-border-subtle, #3b4261)",
                bottom: `${menuPos().bottom}px`,
                left: `${menuPos().left}px`,
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
          </Portal>
        </Show>
      </div>
    </Show>
  )
}
