interface Attachment {
    id: string
    filename: string
    description?: string
    content_type?: string
    size: number
    url: string
    proxy_url: string
    height?: number | null
    width?: number | null
    ephemeral?: boolean
    duration_secs?: number | null
    waveform?: string | null
    flags?: number
}

export interface MessageAPI {
    id: string
    channel_id: string
    content?: string
    timestamp: string
    edited_timestamp?: string | null
    attachments?: Attachment[]
}
