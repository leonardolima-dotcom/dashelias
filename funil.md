# Funnel Visualization Specification

Create a visual funnel component composed of **five sequential stages** representing a conversion journey.

The stages must appear in the following order:

1. Impressões
2. Cliques
3. PageViews
4. Checkout
5. Compras

Each stage should display:

- A stage title
- A numeric value
- A percentage variation indicator

Between each stage, include two supporting metrics positioned around the funnel stage.

Metric layout by stage:

Stage 1  
Impressões  
Metrics: CPC, CTR

Stage 2  
Cliques  
Metrics: C/PageView, ConnectRate

Stage 3  
PageViews  
Metrics: C/Checkout, %Checkout

Stage 4  
Checkout  
Metrics: C/Compra, %Compra

Stage 5  
Compras

All values should be **mocked/static data**, used only to demonstrate the funnel visualization.

No real calculations, data connections, or business logic are required.