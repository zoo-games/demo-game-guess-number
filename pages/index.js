import { Button, Paper, Stack } from '@mui/material'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [allowance, setAllowance] = useState('0');
  const [endTime, setEndTime] = useState('');
  useEffect(()=>{
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      router.push('/login');
    } else {
      fetch('/api/status', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          },
        body: JSON.stringify({jwt})
      }).then(res=>res.json()).then(res=>{
        console.log('status', res);
        if (!res.success || !res.data.allowance || !res.data.endTime || (Number(res.data.allowance) === 0 || Number(res.data.endTime*1000) <= Date.now())) {
          router.push('/login');
        } else {
          setUsername(res.data.username);
          setAllowance(res.data.allowance);
          setEndTime(res.data.endTime);
        }
      })
    }
  }, [router]);
  return (
    <div className={styles.container}>
      <Head>
        <title>Demo Game Number Guessing</title>
        <meta name="description" content="Demo Game Guess Number" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Number Guessing
        </h1>

        <Paper elevation={3} sx={{marginTop: '40px', padding: '20px'}} >
          <Stack spacing={2} direction="column">
            <p>Welcome {username} ~</p>
            Your current game allowance is {allowance} vZOO
            <p>Your play time left {((endTime - Date.now()/1000) / 60).toFixed(0)} mins</p>
            <u>Read Game Rules</u>
            <Button variant='contained' >Start Game</Button>
          </Stack>
        </Paper>
      </main>
    </div>
  )
}
