let currentWord = ""; // Palavra atual
let wordState = []; // Estado da palavra adivinhada
let wordsUsed = []; // Histórico de palavras
let currentInput = ""; // Armazena a palavra em digitação

document.addEventListener("DOMContentLoaded", function () {
	init();
	document.addEventListener("keydown", handleTyping); // Captura o input do teclado
});

// Inicializa o jogo
function init() {
	fetch("../data/words.json")
		.then((response) => response.json())
		.then((data) => {
			const words = data;
			const randomIndex = Math.floor(Math.random() * words.length);
			currentWord = words[randomIndex].word.toUpperCase();
			const hint = words[randomIndex].hint;

			createWordDisplay(currentWord.length);
			wordState = Array(currentWord.length).fill("");
			updateWordDisplay();

			const hintDisplay = document.getElementById("hint");
			hintDisplay.textContent = `Dica: ${hint}`;

			resetGameState();
		})
		.catch((error) => console.error("Erro ao carregar as palavras:", error));
}

// Função para criar os quadradinhos da palavra
function createWordDisplay(wordLength) {
	const wordDisplay = document.getElementById("wordDisplay");
	wordDisplay.innerHTML = "";

	for (let i = 0; i < wordLength; i++) {
		const square = document.createElement("div");
		square.classList.add("letter-square");
		wordDisplay.appendChild(square);
	}
}

// Função para atualizar a exibição dos quadradinhos
function updateWordDisplay() {
	const squares = document.querySelectorAll(".letter-square");
	squares.forEach((square, index) => {
		if (wordState[index]) {
			square.textContent = wordState[index];
			square.classList.add("filled");
		} else {
			square.textContent = "";
			square.classList.remove("filled");
		}
	});
}

function launchConfettiFromCorners() {
	// Confete do canto inferior esquerdo
	confetti({
		particleCount: 100, // Quantidade de confetes
		angle: 60, // Ângulo de lançamento (60 graus para lançar diagonalmente para cima)
		spread: 55, // Espalhamento dos confetes
		origin: { x: 0, y: 1 }, // Origem no canto inferior esquerdo (x: 0, y: 1)
		colors: ["#ffb6c1", "#ffd700", "#87cefa"], // Cores dos confetes
	});

	// Confete do canto inferior direito
	confetti({
		particleCount: 100,
		angle: 120, // Ângulo de lançamento (120 graus para lançar diagonalmente para cima)
		spread: 55,
		origin: { x: 1, y: 1 }, // Origem no canto inferior direito (x: 1, y: 1)
		colors: ["#98fb98", "#ffa07a", "#ba55d3"],
	});
}

// Captura as letras digitadas e preenche os quadrados
function handleTyping(event) {
	const key = event.key.toUpperCase();

	// Permitir apenas letras de A-Z
	if (/^[A-Z]$/.test(key)) {
		currentInput += key; // Adiciona a letra ao input atual
		wordState[currentInput.length - 1] = key; // Preenche o quadradinho correspondente
		updateWordDisplay();

		// Verifica se a palavra está completa
		if (currentInput.length === currentWord.length) {
			checkWord();
		}
	} else if (event.key === "Backspace") {
		removeLastLetter();
	}
}

// Verifica se a palavra está correta
function checkWord() {
	const feedbackDisplay = document.getElementById("feedback");

	if (currentInput === currentWord) {
    feedbackDisplay.style.color = '#98fb98'
		feedbackDisplay.textContent = "Parabéns! Você acertou a palavra!";
		launchConfettiFromCorners(); // Chama o efeito de confetes ao ganhar
    
		setTimeout(() => {
      endGame();
		}, 3000);
	} else {
    feedbackDisplay.style.color = '#ffb6c1'
		feedbackDisplay.textContent = `A palavra ${currentInput} está incorreta.`;
		addToHistory(currentInput);

		destructionEffect();

		setTimeout(() => {
			currentInput = "";
			wordState = Array(currentWord.length).fill("");
			updateWordDisplay();
			feedbackDisplay.textContent = "";
		}, 3000);
	}
}

// Remove a última letra no caso de Backspace
function removeLastLetter() {
	if (currentInput.length > 0) {
		currentInput = currentInput.slice(0, -1); // Remove a última letra
		wordState[currentInput.length] = ""; // Remove a letra do estado
		updateWordDisplay();
	}
}

// Adiciona a palavra ao histórico de tentativas
function addToHistory(word) {
	wordsUsed.push(word);
	const lettersGuessedDisplay = document.getElementById("lettersGuessed");

	// Limpa o histórico caso seja necessário e insere a tentativa mais recente
	const attemptItem = document.createElement("p");
	attemptItem.textContent = `${word} (${countCorrectLetters(
		word,
	)} letras corretas)`;
	lettersGuessedDisplay.appendChild(attemptItem);
}

// Conta quantas letras estão corretas na palavra
function countCorrectLetters(word) {
	let correctCount = 0;
	for (let i = 0; i < currentWord.length; i++) {
		if (word[i] === currentWord[i]) {
			correctCount++;
		}
	}
	return correctCount;
}

// Finaliza o jogo e exibe botões para recomeçar ou voltar
function endGame() {
	const feedbackDisplay = document.getElementById("btn-container");

	const backBtn = document.createElement("button");
	backBtn.innerHTML = '<i class="bi bi-arrow-left"></i>';
	backBtn.classList.add("btn", "neon-button", "mx-2");
	backBtn.addEventListener(
		"click",
		() => (window.location.href = "index.html"),
	);

	// Cria botões de reiniciar e voltar
	const restartBtn = document.createElement("button");
	restartBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
	restartBtn.classList.add("btn", "neon-button", "mx-2");
	restartBtn.addEventListener("click", restartGame);

	feedbackDisplay.appendChild(backBtn);
	feedbackDisplay.appendChild(restartBtn);
}

// Função para criar o efeito de destruição das letras ao errar
function destructionEffect() {
	const squares = document.querySelectorAll(".letter-square");

	squares.forEach((square, index) => {
		const letter = square.textContent; // Pega a letra dentro do quadradinho
		if (letter) {
			setTimeout(() => {
				square.innerHTML = `<span class="letter-destroy">${letter}</span>`; // Insere a letra com uma classe para animação
				const letterSpan = square.querySelector(".letter-destroy");

				// Animação de destruição da letra (fade out)
				letterSpan.style.transition = "opacity 0.5s ease";
				letterSpan.style.opacity = 0;
			}, index * 200); // Destruição gradual das letras
		}
	});
}

// Reinicia o jogo para uma nova partida
function restartGame() {
	init(); // Chama a função init para começar um novo jogo
	const feedbackDisplay = document.getElementById("feedback");
	const buttonsDisplay = document.getElementById("btn-container");
	buttonsDisplay.innerHTML = "";
	feedbackDisplay.innerHTML = "";
}

// Reseta o estado do jogo para uma nova tentativa
function resetGameState() {
	currentInput = "";
	wordsUsed = [];
	const lettersGuessedDisplay = document.getElementById("lettersGuessed");
	lettersGuessedDisplay.innerHTML = ""; // Limpa o histórico
}
