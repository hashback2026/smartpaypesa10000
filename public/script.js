async function sendSTK() {
  const numbers = document.getElementById("numbers").value;
  const amount = document.getElementById("amount").value;
  const reference = document.getElementById("reference").value;

  const resultBox = document.getElementById("result");
  resultBox.textContent = "Processing...";

  try {
    const res = await fetch("/bulk-stk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ numbers, amount, reference })
    });

    const data = await res.json();
    resultBox.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    resultBox.textContent = err.message;
  }
}
