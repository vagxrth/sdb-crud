'use client'

import { PublicKey } from '@solana/web3.js'
import { useCrudProgram, useCrudProgramAccount } from './crud-data-access'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export function CrudCreate() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { createEntry } = useCrudProgram();
  const { publicKey } = useWallet();

  const isFormValid = title.trim() !== '' && message.trim() !== '';

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, message, owner: publicKey });
    }
  }

  if (!publicKey) {
    return <p>Please Connect Wallet!</p>
  }

  return (
    <div>
      <input className='input input-bordered w-full max-w-xs' type="text" placeholder="What you thinking about?" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className='textarea textarea-bordered w-full max-w-xs' name="message" id="message" placeholder='Enter your thoughts' onChange={(e) => setMessage(e.target.value)}></textarea>
      <button onClick={handleSubmit} disabled={createEntry.isPending || !isFormValid} className='btn btn-xs lg:btn-md btn-primary'>Create Journal Entry</button>
    </div>
  )
}

export function CrudList() {
  const { accounts, getProgramAccount } = useCrudProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CrudCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CrudCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCrudProgramAccount({
    account
  })

  const { publicKey } = useWallet();

  const [message, setMessage] = useState('');
  const title = accountQuery.data?.title;

  const isFormValid = message.trim() !== '';

  const handleSubmit = () => {
    if (publicKey && isFormValid && title) {
      updateEntry.mutateAsync({ title, message, owner: publicKey });
    }
  }

  if (!publicKey) {
    <p>Please Connect Your Wallet!</p>
  }

  return accountQuery.isLoading ? (
    <span className='loading loading-spinner loading-lg'></span>) : (
    <div className='card card-bordered border-base-300 border-4 text-neutral-content'>
      <div className='card-body items-center text-center'>
        <div className='space-y-6'>
          <h2 className='card-title justify-center text-3xl cursor-pointer' onClick={() => accountQuery.refetch()}>{accountQuery.data?.title}</h2>
          <p>{accountQuery.data?.message}</p>
          <div className='card-actions justify-around'>
            <textarea className='textarea textarea-bordered w-full max-w-xs' name="message" placeholder='Wanna share more thoughts?' id="message" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
            <button className='btn btn-xs lg:btn-md btn-primary' onClick={handleSubmit} disabled={updateEntry.isPending || !isFormValid}>Update Journal Entry</button>
            <button className='btn btn-xs lg:btn-md btn-primary' onClick={() => {
              const title = accountQuery.data?.title;
              if (title) {
                return deleteEntry.mutateAsync(title);
              }
            }
            } disabled={deleteEntry.isPending}>Delete Journal Entry</button>
          </div>
        </div>
      </div>
    </div>
  )
}
