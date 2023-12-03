import { useEffect } from 'react';
import words from './data/data.json'
import './App.css';
import { createRoot , Root} from 'react-dom/client';
import  Keyboard  from "./components/Keyboard";


function App() 
{
	var currentInput, currentRow
	var word = localStorage.getItem("currentWord")
	var attemptCount = localStorage.getItem("wordle-attemptCount") != null ? localStorage.getItem("wordle-attemptCount") : 0
	var incorrectWords = localStorage.getItem("incorrectWords") != null ? JSON.parse(localStorage.getItem("incorrectWords")) : []

	if(word == null)
	{
		word = getNewWord()
	}

	function getNewWord()
	{
		const newWord = words[Math.floor(Math.random()*words.length)];
		localStorage.setItem("currentWord", newWord)
		console.log("newWord", newWord)
		document.getElementById("App").style = `--wordlength:${newWord.length}`
		return newWord;
	}
	function newGame()
	{
		word = getNewWord()
		for(let key in localStorage)
		{
			if(key.includes('wordle-input') || key.includes('wordle-attemptCount'))
			{
				localStorage.removeItem(key)
			}
		}
		// document.querySelectorAll('.row input').forEach(input => input.value = "")
		attemptCount = 0
		updateAttempCount()
		updateGrid()
		document.querySelector('.restart').blur()
		currentInput = getTargetInput(true)
	}

	const handleTyping = function (e){
		if(e.key == "Enter")
		{
			validateSelection()
		}
		else if(e.key == "Backspace")
		{
			const typedInputs = document.querySelectorAll('.grid .row:not(.over) input.typed')
			if(typedInputs.length > 0)
			{
				const lastTypedInput = typedInputs[typedInputs.length-1]
				resetInput(lastTypedInput)
				currentInput = lastTypedInput
			}
		}
		else if(e.key.length == 1 && e.key.match(/[a-zA-Z]/))
		{
			if(currentInput == null)
			{
				currentInput = getTargetInput()
			}

			if(currentInput != null)
			{
				currentInput.value = e.key;
				currentInput.classList.add('typed')
				localStorage.setItem("wordle-input-"+currentInput.id, currentInput.value)
				currentInput = getTargetInput()
			}
			
		}
		else{
			e.preventDefault()
		}
	}
	
	function getTargetInput(forceNewRow = false)
	{
		if(currentRow == null || forceNewRow)
		{
			currentRow = document.querySelector('.row:not(.over)')
		}
		if(currentRow != null)
		{
			const inputEmpty = currentRow.querySelector('input:not(.typed)')
			if(inputEmpty != null)
			{
				return inputEmpty;
			}
		}
		else{
			return null;
		}
		
	}
	function validateSelection()
	{
		if(currentRow == null)
		{
			currentRow = (document.querySelector('.row:not(.over)'))
		}
		
		if(currentRow != null)
		{
			let selection = "";
			const inputsInRow = currentRow.querySelectorAll('input')
			inputsInRow.forEach(input => selection += input.value)
			if(selection.length < word.length || !words.includes(selection))
			{
				resetRow(currentRow)
			}
			else
			{
				attemptCount += 1
				localStorage.getItem("wordle-attemptCount", attemptCount)
				updateAttempCount()
				setRowColors(currentRow)
				if(selection == word)
				{
					gameOver('You won !')
				}
				else
				{
					currentRow.classList.add('over')
					currentInput = getTargetInput(true)
					if(!currentInput)
					{
						gameOver('You lost... Try again !')
					}
				}
			}
		}
	}
	function gameOver(result)
	{
		document.querySelectorAll('.grid input:not(.typed)').forEach(input => {
			input.classList.add('typed')
			localStorage.setItem('wordle-input-'+input.id, "")
		})
		alert(result)
	}
	function setRowColors(row)
	{
		const rowInputs = row.getElementsByTagName('input')
		const rowValues = []
		for (let index = 0; index < rowInputs.length; index++) {
			const input = rowInputs[index];
			rowValues.push(input.value)
		}
		for (let index = 0; index < rowInputs.length; index++) {
			const input = rowInputs[index];
			input.className = getClassnameInput(input.value, index, rowValues)
		}
	}
	function getClassnameInput(value = null, index, rowValues)
	{
		let classNameInput = ""
		if(value != null && value != "")
		{
			classNameInput += " typed"
			if(value == word[index])
				classNameInput += " correct"
			else if(word.includes(value))
			{
				let countCorrect = 0
				let almosts = 1
				let countThisLetter = 0
				for (let wordIndex = 0; wordIndex < word.length; wordIndex++) 
				{
					const wordLetter = word[wordIndex];
					if(value == wordLetter){
						countThisLetter++
						if(wordLetter == rowValues[wordIndex])
						{
							countCorrect++
						}
						else if(wordIndex != index && wordIndex < index){
							almosts++
						}
					}
				}
				if(countCorrect < countThisLetter && almosts <= countThisLetter)
					classNameInput += " almost"
			}
			else{
				if(!incorrectWords.includes(value))
				{
					incorrectWords.push(value)
					localStorage.setItem('incorrectWords', JSON.stringify(incorrectWords))
				}
			}
		}
		
		return classNameInput;
	}
	function resetRow(row)
	{
		row.querySelectorAll('input').forEach(input => resetInput(input))
		currentInput = getTargetInput()
	}
	function resetInput(input)
	{
		input.value = ""
		localStorage.removeItem("wordle-input-"+input.id)
		input.classList.remove('typed')
	}
	function generateGrid()
	{
		return ([...Array(6)].map((x, i) => {
			const rowValues = [];
			for (let rowKey = 0; rowKey < word.length; rowKey++) {
				let value = localStorage.getItem('wordle-input-'+i+'-'+rowKey);
				if(value != null)
					rowValues.push(value)
			}
			const rowClassname = rowValues.length == word.length ? "row over" : "row"
			return (
			<div className={rowClassname} key={i}>
				{[...Array(word.length)].map((y, j) => {
					let value = localStorage.getItem('wordle-input-'+i+'-'+j);
					let classNameInput = (value != null ? "typed" : "")
					if(rowClassname.includes("over"))
					{
						classNameInput = getClassnameInput(value, j, rowValues)
					}
					return (
						<input key={j} id={i+'-'+j} 
							maxLength={1} pattern='[a-zA-Z]' type='text' 
							className={classNameInput}
							value={value != null ? value : ""} 
							onChange={()=>{}}
						/>
					)
				}
				)}
			</div>
			)
		}
		))
	}
	function updateGrid()
	{
		const grid = document.querySelector('.grid')
		const clonegrid = grid.cloneNode()
		grid.replaceWith(clonegrid)
		createRoot(clonegrid).render(generateGrid())
	}
	function updateAttempCount()
	{
		const attemptsContainer = document.getElementById('attemptsContainer')
		const cloneAttemptsContainer = attemptsContainer.cloneNode()
		attemptsContainer.replaceWith(cloneAttemptsContainer)
		createRoot(cloneAttemptsContainer).render(genAttempCount())
	}
	function genAttempCount()
	{
		return (<h4>
			Attempts: <span>{attemptCount}</span>
			</h4>
		);
	}
	useEffect(()=>{
		window.addEventListener('keydown', handleTyping)
	}, [])
	return (
		<div id='App' className="App" style={{'--wordlength': word.length}}>
			<div id='attemptsContainer'>
				{genAttempCount()}
			</div>
			<div className='grid'>
				{generateGrid()}
			</div>
			<button  className="restart" type="button" onClick={() => newGame()}>
				<svg width="3em" height="3em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M18.364 8.05026L17.6569 7.34315C14.5327 4.21896 9.46734 4.21896 6.34315 7.34315C3.21895 10.4673 3.21895 15.5327 6.34315 18.6569C9.46734 21.7811 14.5327 21.7811 17.6569 18.6569C19.4737 16.84 20.234 14.3668 19.9377 12.0005M18.364 8.05026H14.1213M18.364 8.05026V3.80762" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			</button>
			<Keyboard/>
		</div>
	);
}

export default App;