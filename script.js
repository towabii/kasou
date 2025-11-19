document.addEventListener("DOMContentLoaded", function() {
    // HTML要素を取得
    const osGallery = document.getElementById("os-gallery");
    const vmContainer = document.getElementById("vm-container");
    const screenContainer = document.getElementById("screen-container");
    const statusMessage = document.getElementById("status-message");
    const resetButton = document.getElementById("reset-button");
    const headerSubtitle = document.getElementById("header-subtitle");

    let emulator = null; // 仮想マシンインスタンスを管理

    // ライブラリの場所 (インターネット上のURL)
    const V86_LIB_PATH = "https://unpkg.com/libv86@0.3.4/build/";

    // 起動できるOSのリスト
    const OS_LIST = {
        "Linux": {
            description: "軽量なLinux。すぐに起動します。",
            config: {
                cdrom: { url: "https://k.copy.sh/linux.iso" }
            }
        },
        "Arch Linux": {
            description: "多機能なLinuxディストリビューション。",
            config: {
                cdrom: { url: "https://v86.app/images/archlinux.iso" }
            }
        },
        "FreeDOS": {
            description: "MS-DOS互換のフリーなOS。",
            config: {
                fda: { url: "https://v86.app/images/freedos.img" }
            }
        },
        "Windows 1.01": {
            description: "初代Microsoft Windows。",
            config: {
                fda: { url: "https://v86.app/images/windows101.img" }
            }
        },
    };

    // OSリストから選択ボタン（カード）を自動生成する
    for (const name in OS_LIST) {
        const info = OS_LIST[name];
        const card = document.createElement("div");
        card.className = "os-card";
        card.dataset.osName = name; //どのOSか判別するために名前を保存
        card.innerHTML = `<h3>${name}</h3><p>${info.description}</p>`;
        osGallery.appendChild(card);
    }

    // OSカードがクリックされたときの処理
    osGallery.addEventListener("click", function(event) {
        const card = event.target.closest(".os-card");
        if (!card) return; // カード以外がクリックされたら何もしない

        const osName = card.dataset.osName;
        const osData = OS_LIST[osName];
        startVM(osName, osData.config);
    });

    // 仮想マシンを起動する関数
    function startVM(name, osConfig) {
        // 既存のVMがあれば破棄
        if (emulator) {
            emulator.destroy();
        }

        // 画面の表示を切り替え
        osGallery.style.display = "none";
        vmContainer.style.display = "inline-block";
        resetButton.style.display = "inline-block";
        headerSubtitle.textContent = `${name} を起動中です...`;

        // 基本設定
        const config = {
            screen_container: screenContainer,
            wasm_path: V86_LIB_PATH + "v86.wasm",
            memory_size: 512 * 1024 * 1024, // 512MB
            vga_memory_size: 8 * 1024 * 1024, // 8MB
            bios: { url: V86_LIB_PATH + "seabios.bin" },
            vga_bios: { url: V86_LIB_PATH + "vgabios.bin" },
            autostart: true,
        };
        
        // 選択されたOS固有の設定を合体
        Object.assign(config, osConfig);

        // 仮想マシンを起動
        emulator = new V86Starter(config);
        
        emulator.add_listener("emulator-ready", function() {
            headerSubtitle.textContent = `${name} が動作中`;
        });
    }

    // 「別のOSを選ぶ」ボタンの処理
    resetButton.addEventListener("click", function() {
        if (emulator) {
            emulator.destroy();
            emulator = null;
        }
        // 画面を初期状態に戻す
        vmContainer.style.display = "none";
        osGallery.style.display = "grid";
        resetButton.style.display = "none";
        headerSubtitle.textContent = "起動したいOSをクリックしてください。";
    });
});