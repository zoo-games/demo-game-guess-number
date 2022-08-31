import { Button, Paper, Stack, TextField } from '@mui/material'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
        Guess Number
        </h1>

        <Paper elevation={3} sx={{marginTop: '40px', padding: '20px'}}>
          <Stack spacing={2} direction="column">
            <TextField label='User Name' value={username} onChange={e=>setUsername(e.target.value)} />
            <TextField label='Google 2FA' value={token} onChange={e=>setToken(e.target.value)} />
            <Button variant='contained' type="primary" onClick={async ()=>{
              const rawResponse = await fetch('/api/login', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({username, token, approval: '100', playSeconds: '3600'})
              });
              const content = await rawResponse.json();
              if (content.success) {
                localStorage.setItem('jwt', content.data);
                router.push('/');
              } else {
                console.log('content', content);
              }
            }}>Login and Approve</Button>
          </Stack>
        </Paper>
      </main>
    </div>
  )
}
