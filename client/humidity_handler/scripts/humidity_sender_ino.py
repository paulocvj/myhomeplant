import serial
import subprocess

# Configuração da porta serial
serial_port = "/dev/serial0"  # Ajuste para o seu dispositivo, se necessário
baud_rate = 9600             # Certifique-se de que é o mesmo configurado no Arduino

# Configuração do servidor
url = "http://100.68.242.18:3000/api/humidity"

def send_to_server(humidity):
    try:
        # Monta o comando curl
        curl_command = [
            "curl",
            "-X", "POST", url,
            "-H", "Content-Type: application/json",
            "-d", f'{{"humidity": {humidity}}}'
        ]
        # Executa o comando curl
        subprocess.run(curl_command, check=True)
        print(f"Enviado: {humidity}% para o servidor.")
    except subprocess.CalledProcessError as e:
        print(f"Erro ao enviar para o servidor: {e}")

def main():
    # Abre a porta serial
    try:
        with serial.Serial(serial_port, baud_rate, timeout=1) as ser:
            print(f"Escutando na porta serial {serial_port} a {baud_rate} baud...")
            
            while True:
                # Lê dados da serial
                line = ser.readline().decode("utf-8").strip()
                
                if line:  # Se recebeu dados
                    try:
                        # Converte para porcentagem
                        value = float(line)
                        percentage = int(value * 100)  # Exemplo: 0.72 -> 72
                        
                        # Envia o valor para o servidor
                        send_to_server(percentage)
                    except ValueError:
                        print(f"Valor inválido recebido: {line}")
    except serial.SerialException as e:
        print(f"Erro na porta serial: {e}")

if __name__ == "__main__":
    main()

