import { createResource, Show, type Component } from "solid-js"
import { DropdownMenu } from "@opencode-ai/ui/dropdown-menu"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"

interface UserInfo {
  name: string
  email: string
}

async function fetchUserInfo(): Promise<UserInfo | null> {
  try {
    const resp = await fetch("/_platform/user")
    if (!resp.ok) return null
    return resp.json()
  } catch {
    return null
  }
}

export const UserMenu: Component = () => {
  const [user] = createResource(fetchUserInfo)

  const initials = () => {
    const name = user()?.name ?? user()?.email ?? ""
    const parts = name.split(/[\s@]/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <Show when={user()}>
      <DropdownMenu>
        <Tooltip placement="right" value={user()!.name || user()!.email}>
          <DropdownMenu.Trigger
            as={IconButton}
            variant="ghost"
            size="large"
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
          </DropdownMenu.Trigger>
        </Tooltip>
        <DropdownMenu.Portal>
          <DropdownMenu.Content class="min-w-[200px]">
            <div class="px-3 py-2 border-b border-[var(--v2-border-border-subtle)]">
              <div class="text-sm font-medium">{user()!.name}</div>
              <div class="text-xs opacity-60">{user()!.email}</div>
            </div>
            <DropdownMenu.Item
              onSelect={() => {
                window.location.href = "/_platform/logout"
              }}
            >
              Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
    </Show>
  )
}
