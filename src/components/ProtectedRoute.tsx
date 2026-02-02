import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { Navigate } from "react-router-dom"
import { useAccount } from "wagmi"
import toast from "react-hot-toast"

type Props = {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { isConnected } = useAccount()
  const toastShown = useRef(false)

  useEffect(() => {
    if (!isConnected && !toastShown.current) {
      toast.error("Please connect your wallet to access Payout")
      toastShown.current = true
    }
  }, [isConnected])

  if (!isConnected) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
