use crate::console::style_spinner;
use async_trait::async_trait;
use indicatif::{HumanDuration, MultiProgress, ProgressBar};
use opraas_core::artifacts::build::{
    BatcherBuildArtifact, BuildArtifact, ContractsBuildArtifact, ExplorerBuildArtifact,
    GethBuildArtifact, NodeBuildArtifact, ProposerBuildArtifact,
};
use std::{sync::Arc, thread, time::Instant};

pub struct SetupCommand {
    artifacts: Vec<(&'static str, Arc<dyn BuildArtifact + Send + Sync>)>, 
}

impl SetupCommand {
    pub fn new() -> Self {
        let artifacts: Vec<(&'static str, Arc<dyn BuildArtifact + Send + Sync>)> = vec![
            ("Batcher", Arc::new(BatcherBuildArtifact::new())),
            ("Node", Arc::new(NodeBuildArtifact::new())),
            ("Contracts", Arc::new(ContractsBuildArtifact::new())),
            ("Explorer", Arc::new(ExplorerBuildArtifact::new())),
            ("Proposer", Arc::new(ProposerBuildArtifact::new())),
            ("Geth", Arc::new(GethBuildArtifact::new())),
        ];

        Self { artifacts } 
    }
}

#[async_trait]
impl crate::Runnable for SetupCommand {
    async fn run(&self, cfg: &crate::config::Config) -> Result<(), Box<dyn std::error::Error>> {
        let started = Instant::now();
        let core_cfg = Arc::new(cfg.build_core()?);

        println!("📦 Downloading and preparing artifacts...");

        // Iterate over the artifacts and download
        let m = MultiProgress::new();
        let handles: Vec<_> = self
            .artifacts
            .iter()
            .map(|&(name, ref artifact)| {
                let core_cfg = Arc::clone(&core_cfg);
                let artifact = Arc::clone(artifact); // Clone the Arc for thread ownership
                let spinner = style_spinner(
                    m.add(ProgressBar::new_spinner()),
                    format!("⏳ Preparing {}", name).as_str(),
                );

                thread::spawn(move || {
                    if let Err(e) = artifact.setup(&core_cfg) {
                        eprintln!("Error setting up {}: {}", name, e);
                    }

                    spinner.finish_with_message("Waiting...");
                })
            })
            .collect();

        // Wait for all threads to complete
        for handle in handles {
            let _ = handle.join();
        }
        m.clear().unwrap();

        println!("🎉 Done in {}", HumanDuration(started.elapsed()));

        Ok(())
    }
}
