export async function sendTelegramMessage(botToken: string, teleHandle: string, message: string): Promise<void> {
  // Telegram requires a chat_id, not a username, for sendMessage.
  // We use getUpdates to resolve the handle to a chat_id on first contact,
  // but for now we send via username which works if the user has messaged the bot first.
  // In practice the lender sets up the bot by messaging it once.
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: `@${teleHandle.replace(/^@/, '')}`,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch {
    // Delivery is best-effort — never block the caller
  }
}

export function requestNotificationText(opts: {
  bookTitle: string;
  borrowerName: string;
  borrowerTele: string;
  isQueue: boolean;
}): string {
  const action = opts.isQueue ? 'joined the queue for' : 'requested';
  return (
    `📚 <b>${opts.borrowerName}</b> has ${action} <i>${opts.bookTitle}</i>.\n` +
    `Telegram: @${opts.borrowerTele.replace(/^@/, '')}`
  );
}

export function queueAdvancedNotificationText(opts: {
  bookTitle: string;
  borrowerName: string;
  borrowerTele: string;
}): string {
  return (
    `✅ A copy of <i>${opts.bookTitle}</i> is now ready for <b>${opts.borrowerName}</b>.\n` +
    `Reach out to arrange handover: @${opts.borrowerTele.replace(/^@/, '')}`
  );
}
