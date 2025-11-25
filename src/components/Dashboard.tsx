
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ESTIMATED_APY, REWARD_PER_TASK } from '../constants.ts';
import { Task } from '../types.ts';
import CheckIcon from './icons/CheckIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';

interface DashboardProps {
    publicKey: string;
    stakedAmount: number;
    transactionSignature: string | null;
    onWithdraw: () => void;
    taskEarnings: number;
    onTaskComplete: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ publicKey, stakedAmount, transactionSignature, onWithdraw, taskEarnings, onTaskComplete }) => {
    const formattedPublicKey = `${publicKey.substring(0, 4)}...${publicKey.substring(publicKey.length - 4)}`;
    const [accruedRewards, setAccruedRewards] = useState(0);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [completedTasks, setCompletedTasks] = useState<number[]>([]);
    const [tasksLoading, setTasksLoading] = useState<boolean>(true);
    const [taskError, setTaskError] = useState<string | null>(null);

    // Effect for accruing rewards
    useEffect(() => {
        const rewardsPerSecond = (stakedAmount * (ESTIMATED_APY / 100)) / (365 * 24 * 60 * 60);
        const interval = setInterval(() => {
            setAccruedRewards(prev => prev + rewardsPerSecond);
        }, 1000);
        return () => clearInterval(interval);
    }, [stakedAmount]);

    const fetchTasks = useCallback(async () => {
        setTasksLoading(true);
        setCompletedTasks([]); // Reset completed tasks list for the new set
        setTaskError(null);
        try {
            // Replace process.env.API_KEY with the hardcoded Gemini API key
            const GEMINI_API_KEY = "AIzaSyDJBbPjZgXBgwb-s6ThwmboQrZI1PlxM9c";
            if (!GEMINI_API_KEY) {
                throw new Error("API key is not available.");
            }
            const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Generate 3 new, simple, and distinct tasks a user can perform related to the Solana ecosystem. The current time is ${new Date().toISOString()} to ensure fresh results. Examples: 'Follow a Solana influencer on X', 'Join a Solana community on Discord'. Provide a unique ID for each task.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            tasks: {
                                type: Type.ARRAY,
                                description: "A list of tasks for the user to complete.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.INTEGER, description: 'A unique identifier for the task.' },
                                        title: { type: Type.STRING, description: 'A short, catchy title for the task.' },
                                        description: { type: Type.STRING, description: 'A one-sentence description of what the user needs to do.' },
                                    },
                                    required: ['id', 'title', 'description'],
                                },
                            }
                        },
                    },
                },
            });

            const jsonResponse = JSON.parse(response.text);
            setTasks(jsonResponse.tasks || []);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            setTaskError("Could not load tasks. Please try again.");
        } finally {
            setTasksLoading(false);
        }
    }, []);

    // Initial fetch on component mount
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCompleteTask = (taskId: number) => {
        if (completedTasks.includes(taskId)) return;
        setCompletedTasks(prev => [...prev, taskId]);
        onTaskComplete();
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-8 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-lg animate-fade-in">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center bg-green-500/20 text-green-300 px-4 py-2 rounded-full mb-4">
                    <CheckIcon className="w-5 h-5 mr-2"/>
                    Stake Successful! Your Rewards Are Now Accruing.
                </div>
                <h2 className="text-3xl font-bold text-white">Your Earning Dashboard</h2>
                <p className="text-gray-400 mt-2">Wallet: <span className="font-mono text-purple-400">{formattedPublicKey}</span></p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
                <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-600">
                    <h3 className="text-sm font-medium text-gray-400 uppercase">Total Staked</h3>
                    <p className="text-4xl font-bold text-white mt-2">{stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 })} SOL</p>
                </div>
                 <div className="bg-purple-900/20 p-6 rounded-xl border border-purple-700">
                    <h3 className="text-sm font-medium text-purple-300 uppercase">Live Staking Rewards</h3>
                    <p className="text-3xl font-bold text-white mt-2 tabular-nums">{accruedRewards.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })} SOL</p>
                    <span className="text-xs font-bold text-purple-400/80">{ESTIMATED_APY}% Est. APY</span>
                </div>
                <div className="bg-green-900/20 p-6 rounded-xl border border-green-700">
                    <h3 className="text-sm font-medium text-green-300 uppercase">Task Rewards</h3>
                    <p className="text-4xl font-bold text-green-400 mt-2">{taskEarnings.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} SOL</p>
                </div>
            </div>

            {/* Bonus Tasks Section */}
            <div className="mt-12">
                <h3 className="text-2xl font-bold text-white text-center mb-6">Bonus Tasks to Earn More</h3>
                {tasksLoading && tasks.length === 0 ? (
                    <div className="flex justify-center items-center p-8">
                        <SpinnerIcon className="h-10 w-10 text-purple-400 animate-spin" />
                        <p className="ml-4 text-gray-300">Loading new tasks...</p>
                    </div>
                ) : taskError ? (
                    <div className="text-center p-8 bg-red-900/20 border border-red-700 rounded-xl">
                        <p className="text-red-300">{taskError}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {tasks.map((task) => {
                            const isCompleted = completedTasks.includes(task.id);
                            return (
                                <div key={task.id} className={`bg-gray-800/70 p-6 rounded-xl border ${isCompleted ? 'border-green-500' : 'border-gray-700'} shadow-lg text-left flex flex-col transition-all`}>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-lg text-white">{task.title}</h4>
                                        <p className="text-gray-400 mt-2 text-sm">{task.description}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <button
                                            onClick={() => handleCompleteTask(task.id)}
                                            disabled={isCompleted}
                                            className={`w-full inline-flex items-center justify-center px-4 py-2 text-base font-bold rounded-lg transition-all duration-300 ${isCompleted ? 'bg-green-600/50 text-white cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105'}`}
                                        >
                                            {isCompleted ? <><CheckIcon className="w-5 h-5 mr-2" />Completed</> : `Earn ${REWARD_PER_TASK} SOL`}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="mt-8 text-center">
                    <button
                        onClick={fetchTasks}
                        disabled={tasksLoading}
                        className="inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white bg-gray-600 rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-400 disabled:bg-gray-500 disabled:cursor-wait"
                    >
                        {tasksLoading ? <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> : null}
                        {tasksLoading ? 'Fetching...' : 'Get New Tasks'}
                    </button>
                </div>
            </div>

            <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                    onClick={onWithdraw}
                    className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white bg-purple-600 rounded-full shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
                >
                    Request Withdrawal
                </button>
                {transactionSignature && (
                    <a
                        href={`https://solscan.io/tx/${transactionSignature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium text-purple-300 hover:text-white transition-colors"
                    >
                        View Staking Transaction
                    </a>
                )}
            </div>
        </div>
    );
};
