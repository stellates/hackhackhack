// Hacker Code snippets, terminal logs, and system events for movie-like immersion

export const HACKER_CODE_SNIPPETS = [
  `/* [CVE-2026-0xDEAD] KERNEL PRIVILEGE ESCALATION VULNERABILITY */
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/mman.h>

void *rop_chain[] = {
    (void *)0xffffffff81001234, // pop rdi; ret
    (void *)0x0000000000000000, // prepare_kernel_cred(0)
    (void *)0xffffffff8108a410, // commit_creds()
    (void *)0xffffffff818000b0  // swapgs_restore_regs_and_return_to_usermode
};

int inject_payload(void *target_ptr) {
    printf("[*] Allocating executable memory page at %p...\\n", target_ptr);
    mprotect(target_ptr, 0x1000, PROT_READ | PROT_WRITE | PROT_EXEC);
    memcpy(target_ptr, rop_chain, sizeof(rop_chain));
    return 0x1337;
}`,

  `# QUANTUM LATTICE DECRYPTION MATRIX SOLVER v9.4
import numpy as np
from cryptography.hazmat.primitives.asymmetric import padding

def quantum_annealing_collapse(qubits_matrix, entropy_seed):
    H = np.kron(np.array([[1, 1], [1, -1]]) / np.sqrt(2), qubits_matrix)
    eigenvalues, eigenvectors = np.linalg.eigh(H)
    collapsed_state = eigenvectors[:, np.argmin(eigenvalues)]
    print(f"[!] Superposition state collapsed to basis vector: {collapsed_state[:4]}")
    return np.bitwise_xor(collapsed_state.view(np.uint64), entropy_seed)

class NeuralBypassV3:
    def __init__(self, target_nodes):
        self.weights = np.random.randn(target_nodes, 4096)
        print("[+] Adversarial perturbation loaded into latent space.")`,

  `; x86_64 ZERO-DAY SHELLCODE EXECUTION
section .text
global _start

_start:
    xor rax, rax
    push rax
    mov rdi, 0x68732f6e69622f2f   ; "/bin//sh"
    push rdi
    mov rdi, rsp
    push rax
    mov rdx, rsp
    push rdi
    mov rsi, rsp
    add rax, 59                   ; sys_execve
    syscall                       ; trigger kernel interrupt

payload_stage2:
    nop
    nop
    lea rdx, [rel payload_stage2]
    ret`,

  `// BYPASSING FIREWALL / PACKET CRAFTING ENGINE
async function bypassDeepPacketInspection(socketStream: NetStream): Promise<void> {
    const rawHeaders = Buffer.alloc(128);
    rawHeaders.writeUInt32BE(0x89504E47, 0); // Fake PNG signature encapsulation
    rawHeaders.writeUInt32BE(0x00001337, 4); // Stealth tunnel ID
    
    for (let hop = 0; hop < 7; hop++) {
        await socketStream.relay черезNode({
            hopId: \`node-\${hop}.shadow-mesh.net\`,
            spoofedIp: \`198.51.100.\${Math.floor(Math.random() * 254)}\`,
            ttl: 255 - hop
        });
    }
    console.log("[✓] Proxy cascade established through 7 encrypted hops.");
}`,

  `/* CORE MEMORY INJECTION HOOK */
static inline unsigned long get_kaslr_offset(void) {
    unsigned long base = 0xffffffff81000000;
    unsigned long leaked_ptr = read_kernel_symbol("init_task");
    return leaked_ptr - base;
}

int override_selinux_enforcing(void) {
    unsigned long *selinux_enforcing = (unsigned long *)0xffffffff82643a20;
    *selinux_enforcing = 0; // Disable SELinux
    printk(KERN_ALERT "[+] SELinux enforcing mode disabled by rootkit.\\n");
    return 0;
}`
];

export const TERMINAL_LOGS = [
  "[SYS] Initializing socket injection on port 443...",
  "[NET] Route discovered: 104.28.19.4 -> 172.67.140.21 -> TARGET_CORE",
  "[SEC] WAF detected: CloudShield v4.88. Deploying polymorphic payload.",
  "[MEM] Memory address 0x7FFFFFFFDE00 mapped with RWX privileges.",
  "[CRY] Cracking SHA-512 hash: 4a8b... [Hashcat CUDA cluster engaged]",
  "[KEY] Salt matrix inverted. Rainbow table match at index 98,204.",
  "[ICE] Intrusion Countermeasure Electronics encountered! Rerouting...",
  "[PROXY] Tokyo -> Reykjavik -> Zurich -> Darknet tunnel 100% active.",
  "[DB] Dumping schema: users, credentials, vault_keys, master_certs...",
  "[AUTH] Admin session cookie hijacked: token=eyJhY2Nlc3MiOiJhZG1pbiJ9",
  "[ROOT] PID 1337 spawned with effective UID 0 (root).",
  "[WARN] Security daemon sent ping. Spoofing heartbeat response OK.",
  "[CORE] Overriding cooling systems... Temperature rising.",
  "[PAYLOAD] Zero-day CVE-2026-99999 triggered successfully!",
  "[FIREWALL] Layer-7 inspection bypassed via HTTP/3 pseudo-headers.",
  "[SYS] Kernel page table isolation disabled in memory.",
  "[SYNC] Exfiltrating encrypted vault chunk 4/12 [24.8 GB/s]...",
  "[SHUTDOWN] Silencing system audit logs: /var/log/secure -> /dev/null"
];

export interface DramaticEvent {
  triggerPercent: number;
  title: string;
  subtitle: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}

export const DRAMATIC_EVENTS: DramaticEvent[] = [
  {
    triggerPercent: 15,
    title: "FIREWALL BREACH DETECTED",
    subtitle: "PERIMETER SHIELD COMPROMISED",
    type: 'info'
  },
  {
    triggerPercent: 35,
    title: "COUNTER-INTRUSION SYSTEM ACTIVE",
    subtitle: "NSA / CYBER COMMAND TRACE AT 42%",
    type: 'warning'
  },
  {
    triggerPercent: 60,
    title: "BLACK ICE PROTOCOL ENGAGED",
    subtitle: "REROUTING THROUGH REYKJAVIK QUANTUM PROXIES",
    type: 'danger'
  },
  {
    triggerPercent: 85,
    title: "MAINFRAME CORE EXPOSED",
    subtitle: "COMMENCING MASTER KEY EXTRACTION",
    type: 'warning'
  },
  {
    triggerPercent: 98,
    title: "SYSTEM OVERRIDE READY",
    subtitle: "SMASH ANY KEY OR ENTER TO COMPLETE INVASION!",
    type: 'success'
  }
];

export function generateHexDumpLine(): string {
  const addr = (0x7FFF0000 + Math.floor(Math.random() * 0xFFFF)).toString(16).toUpperCase();
  const hexBytes: string[] = [];
  const chars: string[] = [];

  for (let i = 0; i < 16; i++) {
    const byte = Math.floor(Math.random() * 256);
    hexBytes.push(byte.toString(16).padStart(2, '0').toUpperCase());
    chars.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
  }

  const part1 = hexBytes.slice(0, 8).join(' ');
  const part2 = hexBytes.slice(8, 16).join(' ');
  return `0x${addr}  ${part1}  ${part2}  |${chars.join('')}|`;
}
