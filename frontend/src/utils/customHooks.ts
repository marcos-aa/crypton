import { useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, useState } from "react"
import { useNavigate } from "react-router"
import { NotifType } from "../components/views/Dashboard/Notification"
import api from "../services/api"
import { InputData, local, validateField } from "./helpers"

type InputValidation = InputData & { path: string }

type Notif = {
  type: NotifType
  message: string
  expires?: number
}

const useNotification = () => {
  const [notif, setNotif] = useState<Notif>({
    type: null,
    message: null,
    expires: null,
  })

  const clearNotif = () => {
    setNotif((prev) => {
      clearTimeout(prev.expires)
      return { type: null, message: null }
    })
  }

  const updateNotif = (message: string, type: NotifType = null) => {
    const timeoutId = window.setTimeout(() => {
      clearNotif()
    }, 2000)

    setNotif({ type, message, expires: timeoutId })

    return timeoutId
  }

  return { notif, updateNotif, clearNotif }
}

const useCloseModal = (predecessor: string) => {
  const navigate = useNavigate()

  const closeModal = () => {
    navigate(predecessor)
  }

  return { closeModal }
}
const useLoadError = () => {
  const [error, setError] = useState({
    message: null,
    loading: false,
  })

  const isLoading = (loading: boolean, message: string = null) => {
    setError({ message, loading })
  }

  return { error, isLoading }
}

const useUserInput = () => {
  const [input, setInput] = useState<InputValidation>({
    name: "",
    email: "",
    password: "",
    path: null,
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setInput((prev) => ({
      ...prev,
      [name]: value,
      path: name,
    }))
  }

  return { input, handleChange }
}

const useLogout = (verified: boolean) => {
  const qc = useQueryClient()
  const navigate = useNavigate()

  const handleLogout = async () => {
    delete api.defaults.headers.common.authorization
    if (verified) await api.delete("/session")

    qc.removeQueries({ queryKey: ["streams"] })
    qc.removeQueries({ queryKey: ["user"] })

    localStorage.removeItem(local.token)

    navigate("/")
  }

  return handleLogout
}

const useInputErrors = () => {
  const [warnings, setWarnings] = useState<InputData>(null)

  const updateWarnings = (input: InputValidation) => {
    let warning: string = null

    try {
      validateField(input.path, input)
    } catch (e) {
      warning = e as string
    }

    setWarnings((prev) => ({
      ...prev,
      [input.path]: warning,
    }))
  }

  return { warnings, updateWarnings }
}

export {
  useCloseModal,
  useInputErrors,
  useLoadError,
  useLogout,
  useNotification,
  useUserInput,
}
