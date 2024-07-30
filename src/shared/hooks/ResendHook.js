import { useEffect, useState } from "react"
import useNetwork from '../../functions/common/useNetwork';
import { Endpoints } from '../../enum/Endpoints';
import { SettingsCategoryEnum } from '../../enum/Settings';

export const useResend = () => {
    const settings = JSON.parse(localStorage.getItem('settings'))
    const { online } = useNetwork();

    const [message, setMessage] = useState('')
    const [status, setStatus] = useState('')
    const [open, setOpen] = useState(false)


    useEffect(() => {

        const queryParams = new Set(['robinsonsFTPHost', 'robinsonsFTPUsername', 'robinsonsFTPPassword', 'robinsonsFTPRootPath', 'storeCode'])

        const filteredFields = Object.keys(settings[SettingsCategoryEnum.UnitConfig])
            .filter((key) => {
                if (queryParams.has(key)) return true
                else return false
            })
            .map((key) => {
                return `${key}=${settings[SettingsCategoryEnum.UnitConfig][key]}`
            })

        const queryString = filteredFields.join('&')
        const eventSource = new EventSource(`${Endpoints.ACCREDITATION}/robinson/resend?${queryString}`)
        eventSource.onmessage = (event) => {
            const receivedData = JSON.parse(event.data)
            if (receivedData?.resent) {
                setOpen(true)
                setMessage('Trying to send unsent files…successful')
                setStatus('success')
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [online])

    return [message, status, open, setOpen]
}